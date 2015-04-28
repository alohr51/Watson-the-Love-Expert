var https = require('https');
var flatten = require('./flatten');
var watson = require('watson-developer-cloud');
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var perInsights = appEnv.getService("myPersonalityInsights");

var service_url='';
var service_username='';
var service_password='';

if (appEnv.isLocal) {
  // defaults for dev outside bluemix
  service_url = 'https://gateway.watsonplatform.net/personality-insights/api';
  service_username = '42b9703f-2c5a-4f0e-bc16-57c0229dadea';
  service_password = 'GfO2h2IgA62L';
} 
else {
  service_url = perInsights.credentials.url;
  service_username = perInsights.credentials.username;
  service_password = perInsights.credentials.password;
}

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