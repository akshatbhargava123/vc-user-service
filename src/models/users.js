import { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const User = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: [
      "vendor",
      "rejected vendor",
      "pending vendor",
      "shop manager",
      "customer",
      "subscriber",
      "contributor",
      "author",
      "editor",
      "administrator"
    ],
    required: true
  },
  posts: {
    type: Number,
    required: false
  },
  otp: {
    type: String,
    required: false
  },
  lastOtpRequested: {
    type: Date,
    required: false
  }
});

User.plugin(uniqueValidator, { message: 'Error, {PATH} {VALUE} already exists.' });

const UserModel = (db) => db.model('user', User);

export default UserModel;