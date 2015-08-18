var https = require('https');
var flatten = require('./flatten');
var watson = require('watson-developer-cloud');
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var perInsights = appEnv.getService("myPersonalityInsights");

var service_url = perInsights.credentials.url;
var service_username = perInsights.credentials.username;
var service_password = perInsights.credentials.password;

exports.model = function(req, res){

  var personality_insights = watson.personality_insights({
  username: service_username,
  password: service_password,
  version: 'v2'
  });
    
  personality_insights.profile({
  text: req.body.content },
  function (err, response) {
    if (err)
      return res.send(err);
    else
      var flat_traits = flatten.flat(response.tree);
      res.send({'traits': flat_traits, 'viz':null});
  });
};