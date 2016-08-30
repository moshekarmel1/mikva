var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username. If this is your first time here, you need to register.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));
// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({
    clientID        : process.env.clientID || '1028644396865-6udeeufsfu2rdoiv88ar5q9u1afcktb5.apps.googleusercontent.com',
    clientSecret    : process.env.clientSecret || 'aKmbVsJYbVE9mgUXTuyjit3o',
    callbackURL     : process.env.callbackURL || 'http://localhost:3000/auth/google/callback',
},
function(token, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
        console.log("profile", profile);
        console.log("token", token);
        console.log("refreshToken", refreshToken);
        // try to find the user based on their google id
        User.findOne({ googleId : profile.id }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                // if a user is found, log them in
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                var newUser          = new User();
                // set all of the relevant information
                newUser.googleId   = profile.id;
                newUser.username  = profile.displayName;
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));
