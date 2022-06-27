const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');

const opts = {};

const User = require("./user");

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

passport.use(new jwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({ id : jwt_payload.id }, function(err, user) {
        if(err) {
            return done(err, false);
        }
        if(user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    })
}));