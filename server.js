var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');

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
app.use(bodyParser());

mongoose.connect('mongodb://localhost/mikva');

//default home page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/views/index.html');
});

var PORT = process.env.PORT || '3000';

var server = app.listen(PORT, function(){
  console.log('Server is running!');
});
