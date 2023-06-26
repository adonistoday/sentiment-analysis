const language = require('@google-cloud/language');

const client = new language.LanguageServiceClient();

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';

// Text for sentiment analysis
const positiveText =
  'I am incredibly happy today! It may be the best day ever!';
const negativeText =
  "Oh no, it's Monday. My alarm didn't go off! I have a presentation in afew minutes. This is really bad.";

// Format for Cloud Natural Language API
const positiveDocument = {
  type: 'PLAIN_TEXT',
  content: positiveText,
};
       
const negativeDocument = {
  type: 'PLAIN_TEXT',
  content: negativeText,
};
// Call Cloud Natural Language API sentiment analyzer and console log results 
(async () => {
    const positiveResults = await client.analyzeSentiment({ document: positiveDocument });
    const negativeResults = await client.analyzeSentiment({ document: negativeDocument });
    console.log(positiveResults);
    console.log(negativeResults);
  })();