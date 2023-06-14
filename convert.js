const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs'); // Require the fs module for file operations
const { Storage } = require('@google-cloud/storage');

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';


const language = require('@google-cloud/language');

const sentiment_client = new language.LanguageServiceClient();

const storage = new Storage({
  keyFilename: 'orbital-wording-382318-f1bf751370f5.json' // Replace with the path to your JSON key file
});

// Retrieve list of audio files from folder in Google Cloud Storage
const bucketName = 'adonisbucket';
const directoryPath = 'phonecalldata/test'; // Replace with the path to your directory within the 
const bucket = storage.bucket(bucketName);

// List all objects in the directory
let cnt=-1;
bucket.getFiles({ prefix: directoryPath }, (err, files) => {
  if (err) {
    console.error(`Error retrieving files: ${err}`);
    return;
  }

  // Process each file
  files.forEach(file => {
    cnt=-1;
    // Transcribe audio file with speaker diarization
    transcribeAudioWithDiarization(file);
  });
});

async function transcribeAudioWithDiarization(file){
  const speechClient=new SpeechClient();

// Configure recognition settings with speaker diarization enabled
  const request = {
    config: {
      "enableWordTimeOffsets": true,

          "diarizationSpeakerCount": 2,
          "enableAutomaticPunctuation": true,
          "encoding": "LINEAR16",
          "languageCode": "en-US",
          "model": "phone_call",
          diarizationConfig: {
            enableSpeakerDiarization: true,
            minSpeakerCount: 2,
            maxSpeakerCount: 2,
          },
    },

    audio: {
      uri: `gs://${file.bucket.name}/${file.name}`, // Use audio file URI instead of content
    },
  };
// Perform speech recognition with speaker diarization

const sentiment={
  score:'',
  content:'',
}
let transcriptions=[];
speechClient
    .longRunningRecognize(request)
    .then(([operation]) => {
      return operation.promise();
    })
    .then(results => {
      const resultTranscriptions = results[0].results
        .map(result => {
          const {transcript } = result.alternatives[0];
          const start_time = result.alternatives[0].words[0].startTime.seconds + '.' + result.alternatives[0].words[0].startTime.nanos / 100000000;
          const end_time = result.alternatives[0].words[result.alternatives[0].words.length - 1].endTime.seconds + '.' + result.alternatives[0].words[result.alternatives[0].words.length - 1].endTime.nanos / 100000000;
          const doc = {
            type: 'PLAIN_TEXT',
            content: transcript,
            score:0,
            magnitude:0,
          };
          cnt++;
          return {
            speaker: `Speaker ${cnt%2+1}`,
            start_time,
            end_time,
            transcript
          };
        });

      // Add result transcriptions to the overall transcriptions array
      transcriptions = [...transcriptions, ...resultTranscriptions];
      // transcriptions.forEach(item=>{
      //   const document={
      //     content:item.transcript,
      //     type:'PLAIN_TEXT',
      //   }
      //   sentiment_client
      //     .analyzeSentiment({document:document})
      //     .then(results=>{
      //       const sentiment=results[0].documentSentiment;
      //       item={item,
      //         "score":sentiment.score,
      //       }
      //       console.log(item);
      //     })
      // }
      // );
      // console.log(transcriptions);
    })
    .catch(err => {
      console.error('Error:', err);
    });
}

