const fs = require('fs');


process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Creates a client
const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
 const fileName = 'C:\Users\KGH\Pictures\speechrecognitiongoogleapi\call_recording_0a0ef59b-79b8-45ed-a7a8-b01e991aa731_20230302164639.wav';

const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 8000,
  languageCode: 'en-US',
  enableSpeakerDiarization: true,
  minSpeakerCount: 2,
  maxSpeakerCount: 2,
  model: 'phone_call',
};

const audio = {
  content: fs.readFileSync(fileName).toString('base64'),
};

const request = {
  config: config,
  audio: audio,
};

const [response] = await client.recognize(request);
const transcription = response.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
console.log(`Transcription: ${transcription}`);
console.log('Speaker Diarization:');
const result = response.results[response.results.length - 1];
const wordsInfo = result.alternatives[0].words;
// Note: The transcript within each result is separate and sequential per result.
// However, the words list within an alternative includes all the words
// from all the results thus far. Thus, to get all the words with speaker
// tags, you only have to take the words list from the last result:
wordsInfo.forEach(a =>
  console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
);