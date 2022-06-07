
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3005/users/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
		const user = await User.findOne({ googleId: profile.id });
		if (user) {
			console.log('使用者存在');
			return cb(null, user);
		}
		const password = await bcrypt.hash('QAO7825ACL447', 12);
		const newUser = await User.create({
			email: profile.emails[0].value,
			name: profile.displayName,
			password,
			googleId: profile.id
		})
		return cb(null, newUser);
  }
));