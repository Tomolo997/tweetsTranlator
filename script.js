// twitter
const axios = require("axios");
require("dotenv").config();

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

const translateParams = {
  text: "Hello, how are you today?",
  modelId: "en-es",
};

const getTranslation = async (text, model) => {
  const result = await languageTranslator.translate({
    text: text,
    modelId: model,
  });
  return result.result.translations[0].translation;
};

const ObjectOFTransaltions = [];

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
      break;
    }
    ObjectOFTransaltions.push({
      text: element.text,
      id: element.id,
      translationToEnglish: await getTranslation(element.text, "ar-en"),
    });
  }

  fs.writeFileSync("./tweets.json", JSON.stringify(ObjectOFTransaltions));
};

getTweets();
