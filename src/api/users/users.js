import UserModel from '../../models/users';
import { hashSync, compareSync } from 'bcryptjs';
import { sign as jwtSign } from 'jsonwebtoken';
import { toRes, mongooseErrorHandler, generateRandomString, sendResetPasswordMail } from './../../lib/util';

import twilio from 'twilio';
import { TWILIO_CONFIG } from '../../twilioConfig';

export default ({ req, res, config, db }) => ({

	sendOtp() {
		if (req.body.phone == null || req.body.phone == '')
			return toRes(res)({ message: 'Please send a valid phone number.' });
		UserModel(db).find({ phone: req.body.phone }, (err, results) => {
			if (results == null || results.length == 0) return toRes(res)({ message: 'No User registered with this phone number' });
			const user = results[0];
			const otpGenerated = generateRandomString();
			const client = new twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);
			client.messages.create({
				body: `Hello, your One Time Password for logging into your Vicinity Charter account is ${otpGenerated}. This is valid for approx 30 minutes.`,
				from: TWILIO_CONFIG.phoneNumber,
				to: `+91${req.body.phone}`
			}).then(msg => {
				// associate the otp with specific user
				user.otp = otpGenerated;
				user.lastOtpRequested = new Date().toString();
				user.save((err, results) => {
					if (err) toRes(res)({ message: 'Error in sending OTP' });
					toRes(res)(null, { messsage: 'OTP sent' });
				});
			}).catch(error => {
				toRes(res)({ messsage: error });
			});
		});
	},

	verifyOtp() {
		if (!req.body.phone) return toRes(res)({ message: 'No phone number sent' });
		if (!req.body.otp) return toRes(res)({ message: 'No OTP sent' });
		UserModel(db).find({ phone: req.body.phone }, "-password -__v", (err, results) => {
			const user = results[0];
			if (!user) return toRes(res)({ message: 'No user found with registered phone number' });
			if (new Date(user.lastOtpRequested).getTime() < new Date().getTime() - 1800000) {
				// OTP was received 30 minutes ago, expired!
				return toRes(res)({ message: 'OTP has expired, request a new one' });
			}
			if (user.otp == req.body.otp) {
				user.otp = null;
				user.lastOtpRequested = null;
				user.save((err, result) => {
					const token = jwtSign(user.toJSON(), config.jwt_secret, { expiresIn: 86400 });
					toRes(res)(null, { message: 'OTP verified', token });
				});
			} else toRes(res)({ message: 'Wrong OTP sent' });
		});
	},

	adminLogin() {
		if (!req.body.email) return toRes(res, 500)({ message: 'Email field is required!' });
		if (!req.body.password) return toRes(res, 500)({ message: 'Password field is required!' });
		UserModel(db).findOne({
			email: req.body.email,
			role: 'administrator'
		}, (err, user) => {
			if (err) return toRes(res, 500)(mongooseErrorHandler(err));
			if (!user) return toRes(res, 404)({ message: 'No User Found!' });
			const passwordIsValid = compareSync(req.body.password, user.password);
			if (!passwordIsValid) return toRes(res, 401)({ message: 'Invalid credentials!' });
			const token = jwtSign({
				id: user._id,
				name: user.name,
				email: user.email
			}, config.jwt_secret, { expiresIn: 86400 });
			toRes(res)(null, { token });
		});
	},

	register() {
		const hashedPassword = hashSync(req.body.password, 8);
		UserModel(db).create({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword,
			name: req.body.name,
			website: req.body.website,
			role: req.body.role,
			phone: req.body.phone
		}, (err, result) => {
			if (err) return toRes(res, 500)(mongooseErrorHandler(err));

			if (req.body.sendNotification) {
				// send notification here
			}

			let newUser = result.toJSON();
			delete newUser.password;
			const token = jwtSign(newUser, config.jwt_secret, {
				expiresIn: "30d"
			});
			toRes(res)(err, { token });
		});
	},

	list() {
		UserModel(db).find({}, "-password", (err, users) => {
			if (err) return toRes(res, 500)(mongooseErrorHandler(err));
			users.forEach((user, i) => {
				delete users[i].password;
			});
			toRes(res)(null, { users });
		})
  },
  
  delete() {
    UserModel(db).deleteOne({ _id: req.params.id }, (err,) => {
      if (err) return toRes(res)(mongooseErrorHandler(err));
      toRes(res)(null, { message: 'User successfully deleted' });
    });
  },
  
  resetPasswordRequest() {
    const email = req.body.email;
    if (!email) return toRes(res)({ message: 'No email specified.' });
    UserModel(db).findOne({ email }, (err, result) => {
      if (err) return toRes(res)(mongooseErrorHandler);
      if (!result) return toRes(res, 404)({ message: 'No user registered with the requested email' });

      // user found, now generate a random token and send email to the user
      const user = result;
      const code = generateRandomString(12);
      sendResetPasswordMail(req.body.email, code, (err, info) => {
        if (err) return toRes(res)({ message: err });

        user.passwordResetCode = code;
        user.passwordResetCodeRequested = new Date().toString();
				user.save((err, results) => {
					if (err) toRes(res)({ message: 'Error in sending OTP' });
					toRes(res)(null, { message: 'Password reset email sent' });
				});
      });
    });
  }

});
