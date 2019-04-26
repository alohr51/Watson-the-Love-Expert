const PersonalityInsightsV3 = require("ibm-watson/personality-insights/v3");
const cfenv = require("cfenv");
const appEnv = cfenv.getAppEnv();
const perInsights = appEnv.getService("Personality-Insights-Watson-Love");

const perInsightsURL = perInsights.credentials.url;
const perInsightsUsername = "apikey";
const perInsightsKey = perInsights.credentials.apikey;

exports.model = function(req, res){

	let personalityInsights = new PersonalityInsightsV3({
		username: perInsightsUsername,
		password: perInsightsKey,
		version: '2016-10-19',
		url: perInsightsURL
	});

	personalityInsights.profile(
		{
			content: req.body.content,
			content_type: "text/plain",
			consumption_preferences: true
		},
		function(err, response) {
			if (err) {
				return res.send(err);
			}

			res.send(response);
		}
	);
};