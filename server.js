const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('express-jwt');

const userAuth = require('./auth/user').modules;
const db = require('./db/index');
const dbScripts = require('./db/scripts').modules;
require('./passport');

const app = express();

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", req.headers.origin); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Credentials", "true");
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//serve files from the public dir
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// global error handler
app.use(function(err, req, res, next) {
  // Only handle `next(err)` calls
  if(err){
    res.status(500).json(err.message);
  }
});
// Populate the `Users` & `Flows` tables
db.query(dbScripts.initTables, [], (err, res) => {
    if (err) {
        console.log(err.stack)
    }
});

// default home page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/views/index.html');
});
// authentication middleware
const auth = jwt({
    secret: process.env.SECRET || 'pizza', algorithms: ['HS256'], userProperty: 'payload'
});
// route to register new user
app.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    let user = {};
    user.username = req.body.username;
    user = userAuth.setPassword(req.body.password, user);
    db.query(dbScripts.createUser, [
        user.username,
        user.hash,
        user.salt,
        user.googleId
    ], function (err, response){
        if(err){
            if(err.code === '23505'){
                return res.status(400).json({message: 'Sorry that username is already taken'});
            }
            return next(err);
        }
        user.user_id = response.rows[0].user_id;
        return res.status(200).json({
            token: userAuth.generateJWT(user)
        });
    });
});
// login route
app.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    passport.authenticate('local', function(err, user, info){
        if(err){
            return next(err);
        }
        if(user){
            return res.status(200).json({
                token: userAuth.generateJWT(user)
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});
// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
// the callback after google has authenticated the user
app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect : '/'
}), function(req, res){
    res.redirect('/?token=' + userAuth.generateJWT(req.user));
});

const MikvaCalculation = require('./mikva');

// route to get a users flows
app.get('/flows', auth, function(req, res, next) {
    db.query(dbScripts.findFlowsByUser, [ req.payload._id ], function(err, flowResponse){
        if(err) return next(err);

        res.status(200).json(flowResponse.rows);
    });
});

function removeTime(date){
    return new Date(new Date(date).setHours(0,0,0,0));
}
// route to get a users status
app.get('/status', auth, function(req, res, next) {
    let green, yellow, red;
    db.query(dbScripts.findFlowsByUser, [ req.payload._id ], function(err, flowResponse){
        if(err) return next(err);

        const today = removeTime(new Date()).getTime();
        const flows = flowResponse.rows;
        flows.forEach(flow => {
            // check red
            if(removeTime(flow.saw_blood).getTime() <= today && removeTime(flow.mikva).getTime() >= today){
                if(removeTime(flow.hefsek).getTime() >= today){
                    red = 'Nidda';
                }else{
                    red = 'Shiva Nekiyim';
                }
            }
            // check yellow
            if(removeTime(flow.day30).getTime() == today){
                yellow = 'Day 30';
            }
            if(removeTime(flow.day31).getTime() == today){
                yellow = 'Day 31';
            }
            if(flow.haflaga && removeTime(flow.haflaga).getTime() == today){
                yellow = 'Haflaga';
            }
        });

        if(!red && !yellow){
            green = 'Hakol B\'seder';
        }

        res.status(200).json({
            red: red,
            yellow: yellow,
            green: green
        });
    });
});
// route to post a new flow!
app.post('/flows', auth, function(req, res, next) {
    // first get past flows
    db.query(dbScripts.findFlowsByUser, [ req.payload._id ], function(err, flowResponse){
        if(err) return next(err);

        const date = req.body.date;
        console.log(date, typeof date, req.body);
        const beforeSunset = req.body.beforeSunset;
        const mc = new MikvaCalculation(date, beforeSunset, null, flowResponse.rows);
        db.query(dbScripts.createFlow, [
            mc.saw_blood, 
            mc.hefsek, 
            mc.mikva, 
            mc.day_30, 
            mc.day_31, 
            mc.haflaga, 
            mc.diff_in_days, 
            mc.before_sunset, 
            req.payload._id
        ], function(err, result){
            if(err) return next(err);
            
            res.status(201).json(result.rows[0]);
        });
    });
});
// flow param
app.param('flow', function(req, res, next, id) {
    db.query(dbScripts.findFlowById, [id], function (err, flowResponse){
        if (err) {
            return next(err);
        }
        if (!flowResponse.rows) {
            return next(new Error('Can\'t find flow'));
        }
        req.flow = flowResponse.rows[0];
        return next();
    });
});

// route to edit an existing flow!
app.put('/flows/:flow', auth, function(req, res, next) {
    if (!req.flow) {
        return res.status(400).json('Flow does not exist.');
    }
    if (req.flow.user_id !== req.payload._id) {
        return res.status(401).json('Unauthorized');
    }
    const flow = new MikvaCalculation(req.body.saw_blood, req.body.before_sunset, req.body.hefsek, null);
    // make the updates
    db.query(dbScripts.updateFlow, [
        req.flow.flow_id,
        flow.saw_blood, 
        flow.hefsek, 
        flow.mikva, 
        flow.day_30, 
        flow.day_31, 
        flow.before_sunset
    ], function(err, flowResponse){
        if(err) return next(err);

        res.status(200).json(flowResponse.rows[0]);
    });
});
// route to get a specific flow
app.get('/flows/:flow', auth, function(req, res, next) {
    if (req.flow.user_id !== req.payload._id) {
        return res.status(401).json('Unauthorized');
    }
    res.status(200).json(req.flow);
});
// route to delete a specific flow
app.delete('/flows/:flow', auth, function(req, res, next) {
    if (!req.flow) {
        return res.status(400).json('Flow does not exist.');
    }
    if (req.flow.user_id !== req.payload._id) {
        return res.status(401).json('Unauthorized');
    }
    db.query(dbScripts.deleteFlow, [ req.flow.flow_id ], function(err){
        if(err) return next(new Error('Delete failed'));

        res.status(200).json('Deleted');
    });
});

const PORT = process.env.PORT || '3000';

const server = app.listen(PORT, function(){
  console.log('Server is running!');
});
