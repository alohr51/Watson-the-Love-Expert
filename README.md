# Dr. Watson, The Love Expert!

## Prereq

* Create A Personality Insights Service
  * `cf create-service personality_insights "IBM Watson Personality Insights Monthly Plan" myPersonalityInsights`

* Setup your Twitter user provided service.
  * If you do not have credentials, go get a [Twitter consumer key and secret.](https://apps.twitter.com/app/new)
  * From the Cloud Foundry CLI create your user-provided Twitter service
    * `cf cups myTwitterService -p "consumerKey, consumerSecret"` this will start interactive input for your credentials. Enter your consumer key and secret and hit enter.
  * That's it! Once you are finished hit the deploy to Bluemix button.