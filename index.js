const speech = require('@google-cloud/speech');

// Instantiates a client.
const client = new speech.SpeechClient();
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';

// The path to the remote audio file.
const gcsUri = 'gs://adonisbucket/phonecalldata/test/call_recording_00ba5dc7-3766-4007-9852-a841afebee7e_20230310190900.wav';

// Transcribes your audio file using the specified configuration and prints the transcription.
async function transcribeSpeech() {
  const audio = {
    uri: gcsUri,
  };

  // The audio file's encoding, sample rate in hertz, BCP-47 language code and other settings.
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
    model: "phone_call",
    enableSeparateRecognitionPerChannel: true,
    audioChannelCount: 1,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    profanityFilter: true,
    useEnhanced: true,
    enableWordTimeOffsets: true,
    diarizationConfig: {
      enableSpeakerDiarization: true,
      minSpeakerCount: 2,
      maxSpeakerCount: 5,
    },
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file. This creates a recognition job that you 
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job.
  const [response] = await operation.promise();
  const transcription = response.results
                                .map(result => result.alternatives[0].transcript)
                                .join('\n');
  console.log(`Transcription: ${transcription}`);
}
              
transcribeSpeech();