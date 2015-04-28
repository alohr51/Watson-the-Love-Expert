var twitter = require('twitter');
var OAuth2 = require('oauth').OAuth2;
var https = require('https');
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

var myTwitterService = appEnv.getService("myTwitterService");

exports.tweet = function(req, res){
	var handle = req.query.handle;
	var oauth2 = new OAuth2(myTwitterService.credentials.consumerKey, myTwitterService.credentials.consumerSecret, 'https://api.twitter.com/', null, 'oauth2/token', null);
	oauth2.getOAuthAccessToken('', {'grant_type': 'client_credentials'}, function (e, access_token) {
		var options = {
			hostname: 'api.twitter.com',
			path: '/1.1/statuses/user_timeline.json?screen_name='+handle+'&count=200&',
			headers: {
				Authorization: 'Bearer ' + access_token
			}
		};
	 
		https.get(options, function (result) {
			var buffer = '';
			result.setEncoding('utf8');
			result.on('data', function (data) {
			buffer += data;
		});
		result.on('end', function () {
			var tweets = JSON.parse(buffer);
			res.send(tweets); // the tweets!
			});
		});
	}); 
};