# Watson, The Love Expert!

## [Live Demo](https://watsonlove.mybluemix.net/)

## Deploy your own instance:

* Install the [cf cli](https://github.com/cloudfoundry/cli#downloads) if you do not already have it.

* Set a Bluemix api endpoint, for example: `cf api api.ng.bluemix.net`

* Log into the cf client using your Bluemix account credentials: `cf login`

* Create A Personality Insights Service
  * `cf create-service personality_insights "IBM Watson Personality Insights Monthly Plan" watsonLovePersonalityInsights`

* Setup your Twitter user provided service.
  * If you do not have credentials, go get a [Twitter consumer key and secret.](https://apps.twitter.com/app/new)
  * From the Cloud Foundry CLI create your user-provided Twitter service
    * `cf cups myTwitterService -p "consumerKey, consumerSecret"` this will start interactive input for your credentials. Enter your consumer key and secret and hit enter.

* Clone this repository, `cd` into the new directory and push the app to your Bluemix org using `cf push`
