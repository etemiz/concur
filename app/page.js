"use client";
import { useEffect, useState } from "react";
import { bytesToHex, randomBytes, hexToBytes } from "@noble/hashes/utils";
import { secp256k1 } from "@noble/curves/secp256k1";
import { cbc } from "@noble/ciphers/aes";
import { base64 } from "@scure/base";
import { bech32 } from "bech32";
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  verifyEvent,
} from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";

const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

function convertNostrPublicKeyToHex(npub) {
  const { words } = bech32.decode(npub);
  const bytes = bech32.fromWords(words);
  const hex = Buffer.from(bytes).toString("hex");

  return hex;
}

let pk_other =
  "npub1chadadwep45t4l7xx9z45p72xsxv7833zyy4tctdgh44lpc50nvsrjex2m";
// pk_other = "622f2238d33cf54d8c6181a3475e69e9556df60bb57cbf157fd1ea06eeda41de";
pk_other = convertNostrPublicKeyToHex(pk_other);

export default function Home() {
  const [secretKeyMyself, setSecretKeyMyself] = useState(null);
  const [publicKeyMyself, setPublicKeyMyself] = useState(null);
  const [message, setMessage] = useState("");
  const [relay, setRelay] = useState(null);
  const [messageHistory, setMessageHistory] = useState({});

  const saveKeysToLocalStorage = (secretKey, publicKey) => {
    localStorage.setItem("secretKeyMyself", secretKey);
    localStorage.setItem("publicKeyMyself", publicKey);
  }

  const getKeysFromLocalStorage = () => {
    let secretKey = localStorage.getItem("secretKeyMyself");
    const publicKey = localStorage.getItem("publicKeyMyself");

    return [secretKey, publicKey];
  }

  useEffect(() => {
    let secretKey, publicKey;
    [secretKey, publicKey] = getKeysFromLocalStorage();

    if (secretKey && publicKey) {
      setSecretKeyMyself(secretKey);
      setPublicKeyMyself(publicKey);
    } else {
      secretKey = generateSecretKey();
      secretKey = bytesToHex(secretKey);
      publicKey = getPublicKey(secretKey);

      setSecretKeyMyself(secretKey);
      setPublicKeyMyself(publicKey);
      saveKeysToLocalStorage(secretKey, publicKey)
    }

    (async () => {
      const res = await Relay.connect("wss://nostr.mom");
      setRelay(res);

      res.subscribe([
        {
          kinds: [4],
          authors: [pk_other],
        },
      ], {
        async onevent(event) {
          if (event.pubkey === pk_other && event.tags[0][1] === publicKey) {
            const text = await decrypt(secretKey, pk_other, event.content);
            setMessageHistory(prev => ({
              ...prev,
              [event.id]: { text: text, isUser: false }
            }));
          }
        }
      })
    })();

    return () => { relay?.close() }
  }, []);

  const sendMessage = async () => {
    let eventTemplate = {
      pubkey: publicKeyMyself,
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      tags: [["p", pk_other]],
      content: await encrypt(secretKeyMyself, pk_other, message),
    };


    const signedEvent = finalizeEvent(eventTemplate, hexToBytes(secretKeyMyself));

    const res = await relay.publish(signedEvent);

    setMessageHistory(prev => ({
      ...prev,
      [signedEvent.id]: { text: message, isUser: true }
    }));
    setMessage("");
  };

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

  return (
    <div className="h-[100vh] max-h-[100vh] flex flex-col justify-between">
      <div className="text-3xl text-center font-bold my-4">CONCUR</div>
      <div className="flex-grow justify-end text-black p-4 overflow-y-auto">
        {Object.keys(messageHistory).map((eventId) => {
          const message = messageHistory[eventId];
          return (
            <div
              key={eventId}
              className={`flex flex-col my-2 ${
                message.isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-3 rounded-3xl text-black ${
                  message.isUser ? "bg-green-300" : "bg-blue-300"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex">
        <input
          className="my-4 ml-4 rounded-3xl py-3 pl-3 text-black w-full"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="m-4 rounded p-3 bg-green-500 text-black"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
