"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  convertNostrPublicKeyToHex,
  generatedOrSavedClientKeys,
  addTag,
  encrypt,
} from "../../helpers/nip4Helpers";
import { SimplePool } from "nostr-tools/pool";
import settings from "../../../settings.json";
import { hexToBytes } from "@noble/hashes/utils";
import { finalizeEvent } from "nostr-tools/pure";
import GoldenText from "../../components/GoldenText";

let pk_other =
  "npub1nlk894teh248w2heuu0x8z6jjg2hyxkwdc8cxgrjtm9lnamlskcsghjm9c";
pk_other = convertNostrPublicKeyToHex(pk_other);

const About = () => {
  const pool = new SimplePool();
  const [secretKeyMyself, setSecretKeyMyself] = useState(null);
  const [publicKeyMyself, setPublicKeyMyself] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const listOfRelays = settings.listOfRelays;
  useEffect(() => {
    let { secretKey, publicKey } = generatedOrSavedClientKeys();

    setSecretKeyMyself(secretKey);
    setPublicKeyMyself(publicKey);
  }, []);

  const sendMessage = async () => {
    if (!message) {
      return;
    }

    let created_at_time = Math.floor(Date.now() / 1000);
    let eventTemplate = {
      pubkey: publicKeyMyself,
      created_at: created_at_time,
      kind: 4,
      tags: [],
      content: await encrypt(secretKeyMyself, pk_other, messageContent()),
    };

    eventTemplate = addTag(eventTemplate, "p", pk_other);

    const signedEvent = finalizeEvent(
      eventTemplate,
      hexToBytes(secretKeyMyself)
    );

    await Promise.any(pool.publish(listOfRelays, signedEvent));

    setMessage("");
    setEmail("");
  };

  const messageContent = () => {
    let s;
    if(message) {
      s = message;
    }
    if(email) {
      s = `${s} Email: ${email}`;
    }
    return s;
  }

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-black dark:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25x"
            height="25px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              opacity="0.5"
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88836 21.6244 10.4003 22 12 22Z"
              fill="currentColor"
            />
            <path
              d="M7.825 12.85C7.36937 12.85 7 13.2194 7 13.675C7 14.1306 7.36937 14.5 7.825 14.5H13.875C14.3306 14.5 14.7 14.1306 14.7 13.675C14.7 13.2194 14.3306 12.85 13.875 12.85H7.825Z"
              fill="currentColor"
            />
            <path
              d="M7.825 9C7.36937 9 7 9.36937 7 9.825C7 10.2806 7.36937 10.65 7.825 10.65H16.625C17.0806 10.65 17.45 10.2806 17.45 9.825C17.45 9.36937 17.0806 9 16.625 9H7.825Z"
              fill="currentColor"
            />
          </svg>
        </Link>
        <h1 className="font-roboto py-7 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold text-center text-gray-800 dark:text-gray-300">
          About
        </h1>
        <div className="h-[25px] w-[25px]"></div>
      </div>
      <div className="flex justify-center flex-row-reverse items-center">
        <p className="text-xl font-light font-roboto p-4 text-center bg-white/70 dark:bg-black/20 rounded-xl border dark:border-gray-600 max-w-5xl">
          &quot;Concur is an AI app where you can send your questions to
          experts. Each expert has their own AI model and will answer
          differently. We consciously curate sources of wisdom and experts that
          are aligned with humanity.&quot;
        </p>
      </div>
      <div className="w-full mt-10 mb-10">
        <div className="mx-auto max-w-5xl mx-4">
          <div className="font-roboto font-light p-4 flex flex-col justify-center items-center p-4 text-center bg-white/70 dark:bg-black/20 rounded-xl border w-full dark:border-gray-600">
            <Link
              href="http://etemiz.substack.com/"
              className="font-roboto text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-center text-gray-800 dark:text-gray-300 my-5 decoration-solid underline cursor-pointer"
            >
              Symbiotic Intelligence Blog
            </Link>

            <p className="mx-4 text-xl font-light font-roboto p-4 text-center bg-black/50 dark:bg-white/70 max-w-5xl bg-black text-white dark:text-black dark:bg-white my-3 mb-9 dark:border-gray-600">
              &quot;Talks about our vision.&quot;
            </p>
          </div>
        </div>
      </div>
      <div className="w-full mt-10 mb-10">
        <div className="mx-auto max-w-5xl">
          <div className="font-roboto font-light p-4 flex flex-col justify-center items-center p-4 text-center bg-white/70 dark:bg-black/20 rounded-xl border w-full dark:border-gray-600">
            <p className="font-light font-roboto text-xl py-4 text-center max-w-5xl my-3 mb-9">
              <span className="font-extrabold">&quot;</span>We love feedback.
              Please send them using the form below.
              <span className="font-extrabold">&quot;</span>
            </p>

            <p className="font-roboto text-start">Detailed feedback and bug submitters will get <span className="font-bold"><GoldenText>Golden Brain badge</GoldenText></span> that will work for a few months and will be able to access more features for free. Be sure to add your email for that.</p>

            <br />

            <div className="flex flex-col items-start justify-center w-full">
              <h5 className="font-normal font-roboto text-2xl">
                Contact Founders
              </h5>

              <p className="my-2 font-roboto font-light text-xl">
                Email (optional)
              </p>
              <input
                className="w-full rounded border p-2 bg-white dark:bg-black text-black dark:text-white dark:border-gray-600"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <p className="my-2 font-roboto font-light text-xl">
                Your Message:{" "}
              </p>
              <textarea
                value={message}
                type="text"
                className="w-full rounded border p-2 bg-white dark:bg-black text-black dark:text-white dark:border-gray-600"
                onChange={(e) => setMessage(e.target.value)}
              />

              <button
                onClick={sendMessage}
                className="px-4 py-3 my-4 font-roboto font-light text-xl text-white dark:text-black bg-black dark:bg-gray-300"
              >
                SEND
              </button>

              <p>
                If you prefer to Email founder{" "}
                <a className="underline" href="mailto:et@concur.guru">
                  et@concur.guru
                </a>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
