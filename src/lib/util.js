
import nodemailer from 'nodemailer';

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshat.vc@gmail.com',
    pass: 'StrongestPasswordEver'
  }
});

/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export function toRes(res, status = 200) {
	return (err, thing) => {
		if (err) {
			res.status(status == 200 ? 500 : status).send({ error: true, ...err });
			return res.destroy();
		}

		if (thing && typeof thing.toObject === 'function') {
			thing = thing.toObject();
		}
		res.status(status).json({ error: false, ...thing });
		res.destroy();
	};
}

export function mongooseErrorHandler(err) {
	if (err.errors) {
		const key = Object.keys(err.errors)[0];

		let message = err.errors[key].message;

		if (err.errors[key].properties && err.errors[key].properties.message)
			message = err.errors[key].properties.message.replace('`{PATH}`', key);

		return { message };
	}
	return { message: "Something went wrong!" };
};

export function generateRandomString(length = 6) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@%^*()_+-";

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text.toUpperCase();
}

export function sendResetPasswordMail(to, code, callback) {
  mailTransporter.sendMail({
    from: 'akshat.vc@gmail.com',
    to,
    subject: 'Password reset email for your vicinity charter account',
    html: `
      Hello,
      Go to the link below to reset your password <br/>
      <a href="http://localhost:4200/reset_password?code=${code}&email=${to}" target="_blank">
        Click Here
      </a>
    `
  }, callback);
}