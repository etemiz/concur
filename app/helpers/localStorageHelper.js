const saveKeysToLocalStorage = (secretKey, publicKey) => {
  localStorage.setItem("secretKeyMyself", secretKey);
  localStorage.setItem("publicKeyMyself", publicKey);
};

const getKeysFromLocalStorage = () => {
  let secretKey = localStorage.getItem("secretKeyMyself");
  const publicKey = localStorage.getItem("publicKeyMyself");

  return [secretKey, publicKey];
};

export { saveKeysToLocalStorage, getKeysFromLocalStorage };
