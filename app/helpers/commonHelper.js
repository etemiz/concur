const getCookieValue = (name) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(
      new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)
    );
    return match ? match.pop() : "";
  }
};

const makeAiCanHallucinateMessage = () => {
  return {
    id: "ai-can-hallucinate-message",
    content:
      "AI can hallucinate and make mistakes. You should double check and compare the answers that you get here with a credible source before acting on them.",
    created_at: Math.floor(Date.now() / 1000) + 2,
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

export {
  getCookieValue,
  makeAiCanHallucinateMessage,
  moreThanThreeMinutesHavePassed,
  moreThanAWeekHasPassedSinceLastWarning,
};
