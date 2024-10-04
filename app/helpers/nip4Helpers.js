import { cbc } from "@noble/ciphers/aes";
import { secp256k1 } from "@noble/curves/secp256k1";
import { base64 } from "@scure/base";
import { randomBytes, bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { bech32 } from "bech32";
import {
  saveKeysToLocalStorage,
  getKeysFromLocalStorage,
} from "./localStorageHelper";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import {
  // generateSecretKey,
  // getPublicKey,
  finalizeEvent,
} from "nostr-tools/pure";

const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

async function encrypt(secretKey, pubkey, text) {
  const privkey =
    secretKey instanceof Uint8Array ? bytesToHex(secretKey) : secretKey;
  const key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  const normalizedKey = getNormalizedX(key);

  let iv = Uint8Array.from(randomBytes(16));
  let plaintext = utf8Encoder.encode(text);

  let ciphertext = cbc(normalizedKey, iv).encrypt(plaintext);

  let ctb64 = base64.encode(new Uint8Array(ciphertext));
  let ivb64 = base64.encode(new Uint8Array(iv.buffer));

  return `${ctb64}?iv=${ivb64}`;
}

async function decrypt(secretKey, pubkey, data) {
  const privkey =
    secretKey instanceof Uint8Array ? bytesToHex(secretKey) : secretKey;
  let [ctb64, ivb64] = data.split("?iv=");
  let key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  let normalizedKey = getNormalizedX(key);

  let iv = base64.decode(ivb64);
  let ciphertext = base64.decode(ctb64);

  let plaintext = cbc(normalizedKey, iv).decrypt(ciphertext);

  return utf8Decoder.decode(plaintext);
}

function getNormalizedX(key) {
  return key.slice(1, 33);
}

function convertNostrPublicKeyToHex(npub) {
  const { words } = bech32.decode(npub);
  const bytes = bech32.fromWords(words);
  const hex = Buffer.from(bytes).toString("hex");

  return hex;
}

function generatedOrSavedClientKeys() {
  let secretKey, publicKey;
  [secretKey, publicKey] = getKeysFromLocalStorage();

  if (secretKey && publicKey) {
    return {
      secretKey,
      publicKey,
    };
  } else {
    secretKey = generateSecretKey();
    secretKey = bytesToHex(secretKey);
    publicKey = getPublicKey(secretKey);
    saveKeysToLocalStorage(secretKey, publicKey);

    return {
      secretKey,
      publicKey,
    };
  }
}

async function decryptAndAddBotMessageToMessageHistory(
  event,
  secretKey,
  pk_other,
  sorted,
  setMessageHistory
) {
  const newMessageText = await decrypt(secretKey, pk_other, event.content);

  const res = sorted.insert({
    ...event,
    text: newMessageText,
    isUser: false,
  });

  setMessageHistory([...res.array]);
}

async function decryptAndAddMyMessageToMessageHistory(
  event,
  secretKey,
  pk_other,
  sorted,
  setMessageHistory
) {
  const newMessageText = await decrypt(secretKey, pk_other, event.content);
  const res = sorted.insert({ ...event, text: newMessageText, isUser: true });

  setMessageHistory([...res.array]);
}

const handleReactionForAMessageRecieved = (event, setReactionsOfMessages) => {
  const messageId = event.tags[1][1];
  const newEvent = event;
  const newCreatedAt = newEvent.created_at;

  setReactionsOfMessages((prevReactions) => {
    const existingEvent = prevReactions[messageId];

    if (!existingEvent || newCreatedAt > existingEvent.created_at) {
      return {
        ...prevReactions,
        [messageId]: newEvent,
      };
    }

    return prevReactions;
  });
};

const isMessageAFeedbackOfBotsResponse = (message) => {
  if (message?.includes("Preferred answer:")) {
    return true;
  } else {
    return false;
  }
};

async function makeAFeedbackMessageEventAndPublishToRelayPoolAndClearMessageInputField(
  publicKeyMyself,
  secretKeyMyself,
  pk_other,
  message,
  addReactionDialogOpenForMessage,
  connectionGotCutOff,
  resubscribeToMultipleRelays,
  pool,
  listOfRelays,
  setMessage,
  setConnectionGotCutOff
) {
  try {
    let created_at_time = Math.floor(Date.now() / 1000);
    let eventTemplate = {
      pubkey: publicKeyMyself,
      created_at: created_at_time,
      kind: 4,
      tags: [],
      content: await encrypt(secretKeyMyself, pk_other, message),
    };

    eventTemplate = addTag(eventTemplate, "p", pk_other);
    eventTemplate = addTag(eventTemplate, "preferred", "1");
    eventTemplate = addTag(
      eventTemplate,
      "e",
      addReactionDialogOpenForMessage?.id
    );

    const signedEvent = finalizeEvent(
      eventTemplate,
      hexToBytes(secretKeyMyself)
    );

    if (connectionGotCutOff) resubscribeToMultipleRelays(created_at_time);

    await Promise.any(pool.publish(listOfRelays, signedEvent));

    setMessage("");
  } catch (error) {
    setConnectionGotCutOff(true);
  }
}

async function makeANormalMessageEventAndPublishToRelayPoolAndClearMessageInputField(
  publicKeyMyself,
  secretKeyMyself,
  pk_other,
  message,
  connectionGotCutOff,
  resubscribeToMultipleRelays,
  pool,
  listOfRelays,
  setMessage,
  setConnectionGotCutOff,
  selectedAIModel
) {
  try {
    let created_at_time = Math.floor(Date.now() / 1000);
    let eventTemplate = {
      pubkey: publicKeyMyself,
      created_at: created_at_time,
      kind: 4,
      tags: [],
      content: await encrypt(secretKeyMyself, pk_other, message),
    };

    eventTemplate = addTag(eventTemplate, "p", pk_other);
    eventTemplate = addTag(eventTemplate, "model", selectedAIModel?.model);

    const signedEvent = finalizeEvent(
      eventTemplate,
      hexToBytes(secretKeyMyself)
    );

    if (connectionGotCutOff) resubscribeToMultipleRelays(created_at_time);

    await Promise.any(pool.publish(listOfRelays, signedEvent));

    setMessage("");
  } catch (error) {
    setConnectionGotCutOff(true);
  }
}

const addTag = (event, tagKey, tagValue) => {
  return {
    ...event,
    tags: [...event.tags, [tagKey, tagValue]],
  };
};

export {
  encrypt,
  decrypt,
  convertNostrPublicKeyToHex,
  generatedOrSavedClientKeys,
  decryptAndAddBotMessageToMessageHistory,
  decryptAndAddMyMessageToMessageHistory,
  handleReactionForAMessageRecieved,
  isMessageAFeedbackOfBotsResponse,
  makeAFeedbackMessageEventAndPublishToRelayPoolAndClearMessageInputField,
  makeANormalMessageEventAndPublishToRelayPoolAndClearMessageInputField,
  addTag,
};
