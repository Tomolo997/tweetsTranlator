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
  let stringOfTranslations = "";
  for (let i = 0; i < tweets.length; i++) {
    const element = tweets[i];
    let translation = await getTranslation(element.text, "ar-en");
    stringOfTranslations += translation + " ";
    if (tweetsData.data.meta.newest_id === tweets[0].id) {
      console.log("NO NEW TWEETS");
    }
    ObjectOFTransaltions.push({
      text: element.text,
      id: element.id,
      translationToEnglish: translation,
    });
  }

  let arrayOfTweets = [];
  for (let i = 0; i < stringOfTranslations.length; i++) {
    const el = stringOfTranslations[i];
    if (i % 280 == 0) {
      arrayOfTweets.push(stringOfTranslations.slice(i - 280, i));
    }
  }
  const ThreadOfTweets = stringOfTranslations.match(/.{1,280}/g);
  // arr.splice(index, 0, item); will insert item into arr at the specified index (deleting 0 items first, that is, it's just an insert).

  async function tweetThread(thread) {
    let lastTweetID = "";
    for (const status of thread) {
      const tweet = await client.post("statuses/update", {
        status: status,
        in_reply_to_status_id: lastTweetID,
        auto_populate_reply_metadata: true,
      });
      lastTweetID = tweet.id_str;
    }
  }
  tweetThread(ThreadOfTweets);
  // for (let i = 1; i < ObjectOFTransaltions.length; i++) {
  //   const element = ObjectOFTransaltions[i];
  //   console.log(element.translationToEnglish.length);
  //   functionTORUN(element.translationToEnglish);
  // }
};
getTweets();
