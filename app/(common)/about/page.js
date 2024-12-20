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
import toast from "react-hot-toast";
import ToggleThemeButton from "@/app/components/ToggleThemeButton";

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
    toast("Success!", {
      className: "text-white bg-green-400",
      style: {
        backgroundColor: "#28a745",
        color: "white",
        fontWeight: "bold",
        fontSize: "18px",
      },
    });
  };

  const messageContent = () => {
    let s;
    if (message) {
      s = message;
    }
    if (email) {
      s = `${s} Email: ${email}`;
    }
    return s;
  };

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
        <div className="h-[25px] w-[25px]">
          <ToggleThemeButton />
        </div>
      </div>
      <div className="flex justify-center flex-row-reverse items-center text-gray-800 dark:text-white">
        <p className="text-xl font-light font-roboto p-4 text-center bg-white/70 dark:bg-black/20 rounded-xl border-gray-300 border dark:border-gray-600 max-w-5xl">
          Welcome to PickaBrain.ai, a haven for curious minds! 🌟 This platform
          hosts a diverse array of AI models, each with its unique perspective
          and expertise. Our mission is to curate a collective of wisdom and
          expertise that resonates with humanity&apos;s values.
          <br />
          <br />
          We&apos;re committed to fostering a symbiotic relationship between
          humans and machines, one that harnesses the strengths of both to
          create innovative solutions.
          <br />
          <br />
          While our models may sometimes diverge from mainstream opinions,
          it&apos;s precisely this diversity of thought that can lead to
          breakthroughs and more elegant solutions. Each model brings its own
          distinct voice and approach to the table.
          <br />
          <br />
          Some of our models are designed for entertainment and creative
          exploration, while others are rooted in real-world human wisdom. We
          like to call these &apos;human role models&apos;, who embody the best
          of our collective knowledge and experience.
          <br />
          <br />
          For a deeper dive into our vision and philosophy, please visit our{" "}
          <a href="http://etemiz.substack.com">
            <u>Symbiotic Intelligence Blog</u>
          </a>
          , where we explore the intersection of humans and machines in pursuit
          of a brighter, more harmonious future.
        </p>
      </div>
      <div className="w-full mt-10 mb-10 text-gray-800 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <div className="font-roboto font-light p-4 flex flex-col justify-center items-center p-4 text-center bg-white/70 dark:bg-black/20 rounded-xl border-gray-300 border w-full dark:border-gray-600">
            <p className="font-light font-roboto text-xl py-4 text-center max-w-5xl my-3 mb-9">
              <span className="font-extrabold"></span>We love feedback. Please
              send them using the form below.
              <span className="font-extrabold"></span>
            </p>

            <p className="font-roboto text-start">
              Detailed feedback and bug submitters will get{" "}
              <span className="font-bold">
                <GoldenText>Golden Brain badge</GoldenText>
              </span>{" "}
              that will work for a few months and will be able to access more
              features for free. Be sure to add your email for that.
            </p>

            <br />

            <div className="flex flex-col items-start justify-center w-full">
              <h5 className="font-normal font-roboto text-2xl">
                Contact Founders
              </h5>

              <p className="my-2 font-roboto font-light text-xl">
                Email (optional)
              </p>
              <input
                className="w-full rounded border p-2 bg-white dark:bg-black border-gray-300 text-black dark:text-white dark:border-gray-600"
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
                className="w-full rounded border p-2 bg-white dark:bg-black text-black border-gray-300 dark:text-white dark:border-gray-600"
                onChange={(e) => setMessage(e.target.value)}
              />

              <button
                onClick={sendMessage}
                className="px-4 py-3 my-4 font-roboto font-light text-xl text-white dark:text-black bg-black dark:bg-gray-300"
              >
                SEND
              </button>
              <p></p>
              <p>
                Email:
                <a className="underline" href="mailto:et@concur.guru">
                  et@concur.guru
                </a>
              </p>
              <p>
                Twitter:{" "}
                <a className="underline" href="http://x.com/etemiz/">
                  x.com/etemiz
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
