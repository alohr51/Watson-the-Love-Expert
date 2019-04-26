const OAuth2 = require("oauth").OAuth2;
const https = require("https");
const cfenv = require("cfenv");
const appEnv = cfenv.getAppEnv();

const myTwitterService = appEnv.getService("twitter-service");
const twitterAPIKey = myTwitterService.credentials.apikey;
const twitterSecret = myTwitterService.credentials.secret;
const twitterAPIURL = "https://api.twitter.com/";

exports.tweet = function(req, res){
	let handle = req.query.handle;
	let oauth2 = new OAuth2(twitterAPIKey, twitterSecret, twitterAPIURL, null, "oauth2/token", null);

	oauth2.getOAuthAccessToken("", {"grant_type": "client_credentials"}, function (e, access_token) {
		let options = {
			hostname: "api.twitter.com",
			path: `/1.1/statuses/user_timeline.json?screen_name=${handle}&count=200`,
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		};
	 
		https.get(options, function (result) {
			let buffer = "";
			result.setEncoding("utf8");
			result.on("data", function (data) {
				buffer += data;
			});

			result.on("end", function () {
				let tweets = JSON.parse(buffer);
				res.send(tweets);
			});
		});
	}); 
};