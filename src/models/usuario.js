const mongoose = require('mongoose');

const instaAccountSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
});

const preferencesSchema = new mongoose.Schema({
  useLargerIntervals: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: false },
  useDefaultQuants: { type: Boolean, default: false },
  sendDefault: { type: Number, default: 5 },
  sendLimit: { type: Number, default: 10 },
  attemptLimit: { type: Number, default: 5 },
});

const sessionSchema = new mongoose.Schema({

  session: { type: String },
  username: { type: String }
});

const userSchema = new mongoose.Schema({

  username: { type: String },

  email: { type: String },

  password: { type: String },

  confirmPassword: { type: String },

  userImage: { type: String },

  loogedFirstTime: { type: Boolean, default: false },

  role: { type: Number, default: 1 },

  instaAccounts: [instaAccountSchema],

  sessions: [sessionSchema],

  preferences: preferencesSchema,
});

module.exports = mongoose.model('User', userSchema);
