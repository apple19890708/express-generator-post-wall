
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
  }
));