var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('express-jwt');
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

//serve files from the public dir
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost/mikva');

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
  var date = req.body.date;
  var beforeSunset = req.body.beforeSunset;
  var mc = new MikvaCalculation(date, beforeSunset);
  var flow = new Flow(mc);
  flow.user = req.payload._id;
  flow.beforeSunset = beforeSunset;
  flow.save(function(err, flow){
      if(err){
          return next(err);
      }
      res.status(201).json(flow);
  });
});

var PORT = process.env.PORT || '3000';

var server = app.listen(PORT, function(){
  console.log('Server is running!');
});
