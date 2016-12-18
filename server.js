var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('express-jwt');
var fs = require('fs');

require('./models/user');
require('./models/flow');
require('./passport');

var User = mongoose.model('User');
var Flow = mongoose.model('Flow');

var app = express();

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

mongoose.connect(process.env.MONGO_URI);

//default home page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/views/index.html');
});
//authentication middleware
var auth = jwt({
    secret: process.env.SECRET, userProperty: 'payload'
});

//route to register new user
app.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    var user = new User();
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
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect : '/'
    }), function(req, res){
        res.redirect('/?token=' + req.user.generateJWT());
    });

const MikvaCalculation = require('./mikva');
//route to get a users flows
app.get('/flows', auth, function(req, res, next) {
    Flow.find({ user: req.payload._id }, function(err, flows){
        if(err){
            return next(err);
        }
        res.status(200).json(flows);
    });
});
//route to post a new flow!
app.post('/flows', auth, function(req, res, next) {
    //first get past flows
    Flow.find({ user: req.payload._id }, function(err, flows){
        if(err){
            return next(err);
        }
        var date = req.body.date;
        var beforeSunset = req.body.beforeSunset;
        var mc = new MikvaCalculation(date, beforeSunset, null, flows);
        var flow = new Flow(mc);
        flow.user = req.payload._id;
        flow.save(function(er, fl){
            if(er){
                return next(er);
            }
            res.status(201).json(fl);
        });
    });
});

//flow param
app.param('flow', function(req, res, next, id) {
    var query = Flow.findById(id);
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
    var flow = new MikvaCalculation(req.body.sawBlood,
        req.body.beforeSunset, req.body.hefsek, null);
    //make the updates
    req.flow.beforeSunset = flow.beforeSunset;
    req.flow.sawBlood = flow.sawBlood;
    req.flow.hefsek = flow.hefsek;
    req.flow.mikva = flow.mikva;
    req.flow.day30 = flow.day30;
    req.flow.day31 = flow.day31;
    req.flow.save(function(err, flow){
        if(err){
            return next(err);
        }
        res.status(200).json(flow);
    });
});

//route to get a specific flow!
app.get('/flows/:flow', auth, function(req, res, next) {
    res.status(200).json(req.flow);
});

app.delete('/flows/:flowId', auth, function(req, res, next) {
    Flow.findOneAndRemove({ _id: req.params.flowId }, function(err){
        if(err) res.status(500).json('Delete failed');

        res.status(200).json('Deleted');
    });
});

var PORT = process.env.PORT || '3000';

var server = app.listen(PORT, function(){
  console.log('Server is running!');
});
