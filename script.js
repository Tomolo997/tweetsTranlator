// twitter
const axios = require("axios");
require("dotenv").config();
var Twitter = require("twitter");
const Twitterr = require("twitter-lite");
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");
const { fstat } = require("fs");
const fs = require("fs");
const languageTranslator = new LanguageTranslatorV3({
  version: "2018-05-01",
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_APIKEY,
  }),
  serviceUrl:
    "https://api.au-syd.language-translator.watson.cloud.ibm.com/instances/95d75ec8-71fe-4eee-99b5-e77c401d5be3",
});

const getTranslation = async (text, model) => {
  const result = await languageTranslator.translate({
    text: text,
    modelId: model,
  });
  return result.result.translations[0].translation;
};

const ObjectOFTransaltions = [];
const client = new Twitter({
  consumer_key: process.env.API_TWITTER,
  consumer_secret: process.env.API_SECRETKEY_TWITTER,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const functionTORUN = async (text) => {
  try {
    await client.post("statuses/update", { status: text });
  } catch (error) {
    console.log(error);
  }
};

const config = {
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
};
const getTweets = async () => {
  const tweetsData = await axios.get(
    "https://api.twitter.com/2/users/765407401734447104/tweets",
    config
  );
  ObjectOFTransaltions.push({ newest_id: tweetsData.data.meta.newest_id });
  const tweets = tweetsData.data.data;
  for (let i = 0; i < tweets.length; i++) {
    const element = tweets[i];
    if (tweetsData.data.meta.newest_id === tweets[0].id) {
      console.log("NO NEW TWEETS");
    }
    ObjectOFTransaltions.push({
      text: element.text,
      id: element.id,
      translationToEnglish: await getTranslation(element.text, "ar-en"),
    });
  }
  for (let i = 0; i < ObjectOFTransaltions.length; i++) {
    const element = ObjectOFTransaltions[i];
    functionTORUN(element.translationToEnglish);
  }
};
getTweets();
/*
 *	Code snippet for posting tweets to your own twitter account from node.js.
 *	You must first create an app through twitter, grab the apps key/secret,
 *	and generate your access token/secret (should be same page that you get the
 *	app key/secret).
 * 	Uses oauth package found below:
 *		https://github.com/ciaranj/node-oauth
 *		npm install oauth
 *	For additional usage beyond status updates, refer to twitter api
 *		https://dev.twitter.com/docs/api/1.1
 */

// var OAuth = require("oauth");

// var twitter_application_consumer_key = process.env.API_TWITTER; // API Key
// var twitter_application_secret = process.env.API_SECRETKEY_TWITTER; // API Secret
// var twitter_user_access_token = process.env.ACCESS_TOKEN; // Access Token
// var twitter_user_secret = process.env.ACCESS_TOKEN_SECRET; // Access Token Secret

// var oauth = new OAuth.OAuth(
//   "https://api.twitter.com/oauth/request_token",
//   "https://api.twitter.com/oauth/access_token",
//   twitter_application_consumer_key,
//   twitter_application_secret,
//   "1.0A",
//   null,
//   "HMAC-SHA1"
// );

// var status = ""; // This is the tweet (ie status)

// var postBody = {
//   status: status,
// };

// // console.log('Ready to Tweet article:\n\t', postBody.status);
// oauth.post(
//   "https://api.twitter.com/1.1/statuses/update.json",
//   twitter_user_access_token, // oauth_token (user access token)
//   twitter_user_secret, // oauth_secret (user secret)
//   "time to yea", // post body
//   "application/json", // post content type ?
//   function (err, data, res) {
//     if (err) {
//       console.log(err);
//     } else {
//       // console.log(data);
//     }
//   }
// );
