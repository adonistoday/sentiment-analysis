const speech = require('@google-cloud/speech');
const fs = require('fs');
// Instantiates a client.
const client = new speech.SpeechClient();

// The path to the remote audio file.
const gcsUri = 'gs://adonisbucket/phonecalldata/test/call_recording_0a9c1f41-faee-4ab2-bc04-0d8bd5fee36c_20230324210626.wav';
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'orbital-wording-382318-f1bf751370f5.json';
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
  console.log(response.results.length);
  const result = response.results[response.results.length-1].alternatives[0].words;
  const transcription=result;
  // transcription.push(result[0]);
  // for(let i=0;i<result.length;i++)
  // {
  //   transcription.push(result[i])
  // }
  // let item={
  //   startTime:'',
  //   endTime:'',
  //   speaker:'',
  //   text:'',
  // }
  // let currentSpeaker="";
  // result.forEach(element => {
  //   console.log(element);
  //   transcription.push(element);
  //   // if(element.speakerTag!=currentSpeaker)
  //   // {
  //   //   transcription.push(item);
  //   //   item.startTime=element.startTime.seconds;
  //   //   item.endTime=element.endTime.seconds;
  //   //   item.speaker=element.speakerTag;
  //   //   item.text=element.word;
  //   // }
  //   // else{
  //   //   item.endTime=element.endTime.seconds;
  //   //   item.text=item.text+element.word;
  //   //   currentSpeaker=element.speakerTag;
  //   // }
  // });
                                // .map(result => {
                                //   return result;
                                //   const words = result.alternatives[0].words;
                                //   // if(words[0].speakerTag==0) return; 
                                //   const startTime = words[0].startTime.seconds + '.' + words[0].startTime.nanos;
                                //   const endTime = words[words.length - 1].endTime.seconds + '.' + words[words.length - 1].endTime.nanos;
                                //   const speakerTag = words[0].speakerTag;
                                //   const text = words.map(wordInfo => wordInfo.word).join(' ');
                                  
                                //   return {
                                //     START: Math.floor(startTime/60)+":"+Math.floor(startTime%60),
                                //     END: Math.floor(endTime/60)+":"+Math.floor(endTime%60),
                                //     SPEAKER: `Speaker ${speakerTag}`,
                                //     TEXT: text,
                                //     score: 0 // You can assign a score value here if needed
                                //   };
                                // });
                            
                              // Save transcription to JSON file
                              const transcriptionData = { transcription };
                              const jsonContent = JSON.stringify(transcriptionData, null, 2);
                              fs.writeFileSync('transcription.json', jsonContent);
         
  // console.log(`Transcription: ${transcription}`);
  return transcription;
}

transcribeSpeech();