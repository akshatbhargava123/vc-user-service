import { Router } from 'express';
import users from './users';

export default ({ config, db }) => {
  let api = Router();

  /**
   * @api {post} /users/adminlogin Admin Login
   * @apiGroup User
   * 
   * @apiParam {String} email User's email
   * @apiParam {String} password User's password
   * 
   * @apiSuccess {Boolean} error false
   * @apiSuccess {String} token Authorization Token (JWT)
   */

  api.post('/adminlogin', (req, res) => users({ req, res, config, db }).adminLogin());


  /**
   * @api {post} /users/login/sendotp Send Login OTP
   * @apiGroup User
   * 
   * @apiParam {Number} phone User's phone number
   * 
   * @apiSuccess {Boolean} error false
   * @apiSuccess {String} message OTP sent
   */

  api.post('/login/sendotp', (req, res) => users({ req, res, config, db }).sendOtp());


  /**
   * @api {post} /users/login/verifyotp Verify Login OTP
   * @apiGroup User
   * 
   * @apiParam {Number} phone User's phone number
   * @apiParam {String} otp OTP user received
   * 
   * @apiSuccess {Boolean} error false
   * @apiSuccess {String} message OTP verified
   * @apiSuccess {String} token Authorization Token (JWT)
   */

  api.post('/login/verifyotp', (req, res) => users({ req, res, config, db }).verifyOtp());


  /**
   * @api {post} /users/register Register
   * @apiGroup User
   * 
   * @apiParam {String} username new username
   * @apiParam {String} name User's name
   * @apiParam {String} email Email to be registered
   * @apiParam {String} password Password of new account
   * @apiParam {String} website Password of new account
   * @apiParam {Enum} role
      "vendor" |
      "rejected vendor" |
      "pending vendor" |
      "shop manager" |
      "customer" |
      "subscriber" |
      "contributor" |
      "author" |
      "editor" |
      "administrator"
   * @apiParam {Number} phone 10 digit phone number of the user
   * @apiSuccess {Boolean} error false
   * @apiSuccess {String} token Authorization Token (JWT)
   */

  api.post('/register', (req, res) => users({ req, res, config, db }).register());

  /**
   * @api {post} /users/list List users
   * @apiGroup User
   * 
   * @apiSuccess {Boolean} error false
   * @apiSuccess {Array} users [] (array of users)
   */

  api.get('/list', (req, res) => users({ req, res, config, db }).list());

  return api;
}
