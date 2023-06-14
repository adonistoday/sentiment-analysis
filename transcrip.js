// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');

// Creates a client for interacting with Google Cloud Storage
const storage = new Storage();

// Creates a client for interacting with the Speech-to-Text API
const client = new speech.SpeechClient();

// The name of the audio file in the Google Cloud Storage bucket
const audioFile = 'gs://my-bucket/my-audio-file.flac';

// Downloads the audio file from the bucket to a local file
const bucketName = 'my-bucket';
const remoteFile = storage.bucket(bucketName).file('my-audio-file.flac');
const localFile = './my-audio-file.flac';
await remoteFile.download({destination: localFile});

// Reads the audio file into memory
const file = await fs.promises.readFile(localFile);

// Transcribes the audio file using the Speech-to-Text API
const [response] = await client.recognize({
  audio: {content: file},
  config: {
    encoding: 'FLAC',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  },
});

// Logs the transcription
const transcription = response.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
console.log(`Transcription: ${transcription}`);
