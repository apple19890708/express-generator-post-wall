
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');

const jsonPath = '_json'; //作用?

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.HEROKU_URL}/users/google/callback`
  },
  async (accessToken, refreshToken, profile, cb) => {
		return cb(null, profile[jsonPath]);

		// 舊方法
		// const user = await User.findOne({ googleId: profile.id });
		// if (user) {
		// 	console.log('使用者存在');
		// 	return cb(null, user);
		// }
		// const password = await bcrypt.hash('QAO7825ACL447', 12);
		// const newUser = await User.create({
		// 	email: profile.emails[0].value,
		// 	name: profile.displayName,
		// 	password,
		// 	googleId: profile.id
		// })
		// return cb(null, newUser);
  }
));