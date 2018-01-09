const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('express-jwt');

require('./models/user');
require('./models/flow');
require('./passport');

const User = mongoose.model('User');
const Flow = mongoose.model('Flow');

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

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/flows');

//default home page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/views/index.html');
});
//authentication middleware
const auth = jwt({
    secret: process.env.SECRET || 'TEST', userProperty: 'payload'
});

//route to register new user
app.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    const user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password);
    user.save(function (err){
        if(err){
            if(err.code === 11000){
                return res.status(400).json({message: 'Sorry that username is already taken'});
            }
            return next(err);
        }
        return res.status(200).json({
            token: user.generateJWT()
        });
    });
});
//login route
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
                token: user.generateJWT()
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
    res.redirect('/?token=' + req.user.generateJWT());
});

const MikvaCalculation = require('./mikva');

//route to get a users flows
app.get('/flows', auth, function(req, res, next) {
    Flow.find({ user: req.payload._id }, function(err, flows){
        if(err) return next(err);

        res.status(200).json(flows);
    });
});

function removeTime(date){
    return new Date(new Date(date).setHours(0,0,0,0));
}

//route to get a users status
app.get('/status', auth, function(req, res, next) {
    let green, yellow, red;
    Flow.find({ user: req.payload._id }, function(err, flows){
        if(err) return next(err);
        const today = removeTime(new Date()).getTime();
        flows.forEach(flow => {
            // check red
            if(removeTime(flow.sawBlood).getTime() <= today && removeTime(flow.mikva).getTime() >= today){
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
            green = 'Hakol B\'seder!';
        }

        res.status(200).json({
            red: red,
            yellow: yellow,
            green: green
        });
    });
});
//route to post a new flow!
app.post('/flows', auth, function(req, res, next) {
    //first get past flows
    Flow.find({ user: req.payload._id }, function(err, flows){
        if(err) return next(err);

        const date = req.body.date;
        const beforeSunset = req.body.beforeSunset;
        const mc = new MikvaCalculation(date, beforeSunset, null, flows);
        const flow = new Flow(mc);
        flow.user = req.payload._id;
        flow.save(function(err, result){
            if(err) return next(er);
            
            res.status(201).json(result);
        });
    });
});

//flow param
app.param('flow', function(req, res, next, id) {
    const query = Flow.findById(id);
    query.exec(function (err, flow){
        if (err) {
            return next(err);
        }
        if (!flow) {
            return next(new Error('can\'t find flow'));
        }
        req.flow = flow;
        return next();
    });
});

//route to edit an existing flow!
app.put('/flows/:flow', auth, function(req, res, next) {
    const flow = new MikvaCalculation(req.body.sawBlood, req.body.beforeSunset, req.body.hefsek, null);
    //make the updates
    req.flow.beforeSunset = flow.beforeSunset;
    req.flow.sawBlood = flow.sawBlood;
    req.flow.hefsek = flow.hefsek;
    req.flow.mikva = flow.mikva;
    req.flow.day30 = flow.day30;
    req.flow.day31 = flow.day31;
    req.flow.save(function(err, flow){
        if(err) return next(err);

        res.status(200).json(flow);
    });
});

//route to get a specific flow!
app.get('/flows/:flow', auth, function(req, res, next) {
    res.status(200).json(req.flow);
});

app.delete('/flows/:flowId', auth, function(req, res, next) {
    Flow.findOneAndRemove({ _id: req.params.flowId }, function(err){
        if(err) return next(new Error('Delete failed'));

        res.status(200).json('Deleted');
    });
});

const PORT = process.env.PORT || '3000';

const server = app.listen(PORT, function(){
  console.log('Server is running!');
});
