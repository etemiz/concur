const saveKeysToLocalStorage = (secretKey, publicKey) => {
  localStorage.setItem("secretKeyMyself", secretKey);
  localStorage.setItem("publicKeyMyself", publicKey);
};

const getKeysFromLocalStorage = () => {
  let secretKey = localStorage.getItem("secretKeyMyself");
  const publicKey = localStorage.getItem("publicKeyMyself");

  return [secretKey, publicKey];
};

const saveAiCanHalucinateMessageToLocalStorage = (message) => {
  // Convert JSON to string before saving
  localStorage.setItem("aiCanHalucinateMessage", JSON.stringify(message));
};

const getAiCanHalucinateMessageFromLocalStorage = () => {
  // Parse the string back into JSON
  const message = localStorage.getItem("aiCanHalucinateMessage");
  return message ? JSON.parse(message) : null;
};

export {
  saveKeysToLocalStorage,
  getKeysFromLocalStorage,
  getAiCanHalucinateMessageFromLocalStorage,
  saveAiCanHalucinateMessageToLocalStorage,
};
