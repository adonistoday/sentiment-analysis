const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech').v1p1beta1;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';
// Set up Google Cloud Storage client
const storage = new Storage({
  keyFilename: 'orbital-wording-382318-f1bf751370f5.json' // Replace with the path to your JSON key file
});

// Configuration for Speech-to-Text API
const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
  enableSpeakerDiarization: true, // Enable speaker diarization
  diarizationSpeakerCount: 2, // Set the number of speakers in the audio file
};

// Retrieve list of audio files from folder in Google Cloud Storage
const bucketName = 'adonisbucket';
const directoryPath = 'phonecalldata/test'; // Replace with the path to your directory within the bucket
const bucket = storage.bucket(bucketName);

// List all objects in the directory
bucket.getFiles({ prefix: directoryPath }, (err, files) => {
  if (err) {
    console.error(`Error retrieving files: ${err}`);
    return;
  }

  // Process each file
  files.forEach(file => {
    // Transcribe audio file with speaker diarization
    transcribeAudioWithDiarization(file);
  });
});

// Function to transcribe audio file with speaker diarization using Speech-to-Text API
async function transcribeAudioWithDiarization(file) {
  const client = new speech.SpeechClient();

  const request = {
    config,
    audio: {
      uri: `gs://${file.bucket.name}/${file.name}`,
    },
  };

  const [operation] = await client.longRunningRecognize(request);
  const [response ] = await operation.promise();

  // Extract transcriptions and speaker tags from the API response
  const transcriptions = response.results.map(result => ({
    transcription: result.alternatives[0].transcript,
    speakerTag: result.alternatives[0].words.map(word => word.speakerTag),
  }));

  // Save transcriptions and speaker tags to CSV file
  const csvWriter = createCsvWriter({
    path: `transcriptions_${file.name}.csv`, // Replace with desired CSV file name
    header: [
      { id: 'transcription', title: 'Transcription' },
      { id: 'speakerTag', title: 'Speaker Tag' },
    ],
  });

  await csvWriter.writeRecords(
    transcriptions.flatMap((transcription, index) =>
      transcription.speakerTag.map(tag => ({
        transcription: transcription.transcription,
        speakerTag: tag,
      }))
    )
  );

  console.log(`Transcriptions with speaker tags for file ${file.name} saved to CSV.`);
}