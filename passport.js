var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const userAuth = require('./auth/user').modules;
const db = require('./db/index');
const dbScripts = require('./db/scripts').modules;

passport.use(new LocalStrategy(
    function(username, password, done) {
        db.query(dbScripts.findUserByUsername, [username], function (err, userResponse) {
            if (err) { return done(err); }
            if (!userResponse || !userResponse.rows || !userResponse.rows[0]) {
                return done(null, false, { message: 'Incorrect username. If this is your first time here, you need to register.' });
            }
            const user = userResponse.rows[0];
            if (!userAuth.validPassword(password, user)) {
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
    clientID        : process.env.clientID,
    clientSecret    : process.env.clientSecret,
    callbackURL     : process.env.callbackURL || '/auth/google/callback',
},
function(token, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
        // try to find the user based on their google id
        db.query(dbScripts.findUserByGoogleId, [profile.id], function (err, userResponse) {
            if (err)
                return done(err);
            
            let user;
            if (userResponse && userResponse.rows) {
                user = userResponse.rows[0];
            }
            if (user) {
                // if a user is found, log them in
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                db.query(dbScripts.createUser, [
                    profile.displayName,
                    null,
                    null,
                    profile.id
                ], function(err, userResponse) {
                    if (err) throw err;
                    
                    return done(null, userResponse.rows[0]);
                });
            }
        });
    });
}));
