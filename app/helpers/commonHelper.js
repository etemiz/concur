const getCookieValue = (name) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(
      new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)
    );
    return match ? match.pop() : "";
  }
};

const makeAiCanHallucinateMessage = (time_for_ai_can_hallucinate_message) => {
  return {
    id: "ai-can-hallucinate-message",
    content:
      "AI can hallucinate and make mistakes. You should double check and compare the answers that you get here with a credible source before acting on them.",
    created_at: time_for_ai_can_hallucinate_message,
    isReferencingTheMessage: "",
  };
};

function moreThanThreeMinutesHavePassed(res) {
  const threeMinutesInMillis = 3 * 60 * 1000;
  const createdAtTime = res.created_at * 1000; // Convert UNIX time to milliseconds
  const currentTime = Date.now();

  return currentTime - createdAtTime > threeMinutesInMillis;
}

function moreThanAWeekHasPassedSinceLastWarning(res) {
  const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
  const createdAtTime = res.created_at * 1000; // Convert UNIX time to milliseconds
  const currentTime = Date.now();

  return currentTime - createdAtTime > oneWeekInMillis;
}

function speech(text) {
  if (
    typeof window !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined"
  ) {
    // const someUtterance = new SpeechSynthesisUtterance(text);
    // speechSynthesis.speak(someUtterance);

    var myLongText = text;

    var utterance = new SpeechSynthesisUtterance(myLongText);

    //modify it as you normally would
    var voiceArr = speechSynthesis.getVoices();
    utterance.voice = voiceArr[2];

    //pass it into the chunking function to have it played out.
    //you can set the max number of characters by changing the chunkLength property below.
    //a callback function can also be added that will fire once the entire text has been spoken.
    speechUtteranceChunker(
      utterance,
      {
        chunkLength: 120,
      },
      function () {
        //some code to execute when done
        console.log("done");
      }
    );
  }
}

var speechUtteranceChunker = function (utt, settings, callback) {
  settings = settings || {};
  var newUtt;
  var txt =
    settings && settings.offset !== undefined
      ? utt.text.substring(settings.offset)
      : utt.text;

  var chunkLength = (settings && settings.chunkLength) || 160;
  var pattRegex = new RegExp(
    "^[\\s\\S]{" +
      Math.floor(chunkLength / 2) +
      "," +
      chunkLength +
      "}[.!?,]{1}|^[\\s\\S]{1," +
      chunkLength +
      "}$|^[\\s\\S]{1," +
      chunkLength +
      "} "
  );
  var chunkArr = txt.match(pattRegex);

  if (chunkArr[0] === undefined || chunkArr[0].length <= 2) {
    //call once all text has been spoken...
    if (callback !== undefined) {
      callback();
    }
    return;
  }
  var chunk = chunkArr[0];
  newUtt = new SpeechSynthesisUtterance(chunk);
  var x;
  for (x in utt) {
    if (utt.hasOwnProperty(x) && x !== "text") {
      newUtt[x] = utt[x];
    }
  }
  newUtt.addEventListener("end", function () {
    if (speechUtteranceChunker.cancel) {
      speechUtteranceChunker.cancel = false;
      return;
    }
    settings.offset = settings.offset || 0;
    settings.offset += chunk.length - 1;
    speechUtteranceChunker(utt, settings, callback);
  });

  if (settings.modifier) {
    settings.modifier(newUtt);
  }
  console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
  //placing the speak invocation inside a callback fixes ordering and onend issues.
  setTimeout(function () {
    speechSynthesis.speak(newUtt);
  }, 0);
};

export {
  getCookieValue,
  makeAiCanHallucinateMessage,
  moreThanThreeMinutesHavePassed,
  moreThanAWeekHasPassedSinceLastWarning,
  speech,
};
