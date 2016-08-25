/*
Watson the Love Expert!
Created by: Andrew Lohr, ajlohr@us.ibm.com
*/

var express = require('express');
var app = express();
var userModeling = require('./userModeling');
var twitter = require('./twitter');
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Configure static folder.
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Handle Routes.
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/results', function(req, res) {
  res.render('results');
});

app.post('/model',userModeling.model);

app.get('/tweet',twitter.tweet);

app.listen(appEnv.port, appEnv.bind);
console.log('App started on ' + appEnv.bind + ':' + appEnv.port);