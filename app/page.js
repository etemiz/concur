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
import Image from "next/image";
import Message from "./components/Message";
import TextareaAutosize from "react-textarea-autosize";
import SelectModelDialog from "./components/SelectModelDialog";

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
  const [isSelectModelDialogOpen, setIsSelectModelDialogOpen] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState({
    model: "def",
    name: "O.S.",
    description: "Generalist, Libertarian",
  });

  const saveKeysToLocalStorage = (secretKey, publicKey) => {
    localStorage.setItem("secretKeyMyself", secretKey);
    localStorage.setItem("publicKeyMyself", publicKey);
  };

  const getKeysFromLocalStorage = () => {
    let secretKey = localStorage.getItem("secretKeyMyself");
    const publicKey = localStorage.getItem("publicKeyMyself");

    return [secretKey, publicKey];
  };

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
      saveKeysToLocalStorage(secretKey, publicKey);
    }

    (async () => {
      const res = await Relay.connect("wss://nostr.mom");
      setRelay(res);

      res.subscribe(
        [
          {
            kinds: [4],
            authors: [pk_other, publicKey],
          },
        ],
        {
          async onevent(event) {
            if (event.pubkey === pk_other && event.tags[0][1] === publicKey) {
              const text = await decrypt(secretKey, pk_other, event.content);
              setMessageHistory((prev) => ({
                ...prev,
                [event.id]: { text: text, isUser: false },
              }));
            }
            if (event.pubkey === publicKey && event.tags[0][1] === pk_other) {
              const text = await decrypt(secretKey, pk_other, event.content);
              setMessageHistory((prev) => ({
                ...prev,
                [event.id]: { text: text, isUser: true },
              }));
            }
          },
        }
      );
    })();

    return () => {
      relay?.close();
    };
  }, []);

  const sendMessage = async () => {
    let eventTemplate = {
      pubkey: publicKeyMyself,
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      tags: [["p", pk_other]],
      content: await encrypt(secretKeyMyself, pk_other, message),
    };

    const signedEvent = finalizeEvent(
      eventTemplate,
      hexToBytes(secretKeyMyself)
    );

    const res = await relay.publish(signedEvent);

    setMessageHistory((prev) => ({
      ...prev,
      [signedEvent.id]: { text: message, isUser: true },
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
      event.preventDefault();
    }
  };

  return (
    <div className="font-roboto h-[100vh] max-h-[100vh] flex flex-col justify-between bg-white dark:bg-gray-900">
      <div className="py-4 flex items-center">
        <div
          className="p-2 m-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setIsSelectModelDialogOpen(true)}
        >
          <svg
            className="h-6 text-black dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>

        <div className="flex items-center">
          <div className="h-[35px] w-[35px]">
            <Image
              src="/BotPic.png"
              width={35}
              height={35}
              alt="Potrait of an Ostrich"
              style={{ borderRadius: "50%" }}
            />
          </div>

          <div className="flex flex-col ml-4">
            <div className="text-md font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto dark:text-gray-200">
              {selectedAIModel.name} {selectedAIModel.description}
            </div>
            <div className="text-[13px] text-[#6b6b6b] dark:text-gray-400">
              By @Conscious Curations
            </div>
          </div>
          <div className="px-2"></div>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow justify-end w-full">
        <div className="overflow-y-auto flex-grow justify-end text-black dark:text-gray-100 p-4 max-w-3xl mx-auto w-full">
          <div className="w-full flex flex-col items-center">
            <div className="h-[60px] w-[60px]">
              <Image
                src="/BotPic.png"
                width={60}
                height={60}
                alt="Potrait of an Ostrich"
                style={{ borderRadius: "50%" }}
              />
            </div>

            <div className="flex flex-col items-center ml-4">
              <div className="text-md py-1 text-center font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto dark:text-gray-200">
                {selectedAIModel.name} {selectedAIModel.description}
              </div>
              <div className="text-[13px] text-[#6b6b6b] dark:text-gray-400 py-1">
                By @Conscious Curations
              </div>
            </div>
          </div>

          {Object.keys(messageHistory).map((eventId) => {
            const message = messageHistory[eventId];
            return (
              <Message
                key={eventId}
                message={message.text}
                isUser={message.isUser}
                imageSource={message.isUser ? "/Y.png" : "/BotPic.png"}
                name={message.isUser ? "You" : selectedAIModel.name}
              />
            );
          })}
          <div className="h-[100px] bg-transparent"></div>
        </div>
      </div>
      <div className="h-[100px] bg-transparent"></div>
      <div className="w-full px-8 pb-3 fixed bottom-0 bg-[#FFFFFF] dark:bg-[#111827]">
        <div className="flex rounded-[30px] max-w-3xl mx-auto items-center p-3 text-black dark:text-gray-100 w-full border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800">
          <TextareaAutosize
            className="w-full border-none bg-transparent dark:bg-transparent focus:outline-none focus:ring-0"
            minRows={1}
            maxRows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message here..."
            onKeyDown={handleKeyDown}
          />

          <button
            disabled={!message}
            onClick={sendMessage}
            className="self-end p-2 rounded-full h-10 w-10 bg-black dark:bg-white flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              height="1.25em"
              className="text-white dark:text-black"
            >
              <path
                d="M3.113 6.178C2.448 4.073 4.64 2.202 6.615 3.19l13.149 6.575c1.842.921 1.842 3.55 0 4.472l-13.15 6.575c-1.974.987-4.166-.884-3.501-2.99L4.635 13H9a1 1 0 1 0 0-2H4.635z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <SelectModelDialog
        isSelectModelDialogOpen={isSelectModelDialogOpen}
        setIsSelectModelDialogOpen={setIsSelectModelDialogOpen}
        setSelectedAIModel={setSelectedAIModel}
      />
    </div>
  );
}
