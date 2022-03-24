const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { JWT_TOKEN_SECRET } = process.env;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, 'Invalid credentials');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, 'Invalid credentials');
      }
      return done(null, user, 'Logged in successfully');
    } catch (error) {
      return done(error);
    }
  })
);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload._id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

exports.verifyUser = passport.authenticate('jwt', { session: false });
