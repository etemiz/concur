"use client";
import { useEffect, useState } from "react";
import { bytesToHex, randomBytes, hexToBytes } from "@noble/hashes/utils";
import { bech32 } from "bech32";
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
} from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";
import Image from "next/image";
import Message from "./components/Message";
import TextareaAutosize from "react-textarea-autosize";
import SelectModelDialog from "./components/SelectModelDialog";
import { encrypt, decrypt } from "./helpers/nip4Helpers";
import {
  saveKeysToLocalStorage,
  getKeysFromLocalStorage,
} from "./helpers/localStorageHelper";
import { convertNostrPublicKeyToHex } from "./helpers/nip4Helpers";
import aiModelsData from "../ai-models.json";
import BrainSvg from "./svgs/BrainSvg";
import { usePathname } from "next/navigation";

let pk_other =
  "npub1chadadwep45t4l7xx9z45p72xsxv7833zyy4tctdgh44lpc50nvsrjex2m";
// pk_other = "622f2238d33cf54d8c6181a3475e69e9556df60bb57cbf157fd1ea06eeda41de";
pk_other = convertNostrPublicKeyToHex(pk_other);

export default function MyLayout() {
  const selectedAIModelBasedOnPath = () => {
    let modelAccordingToPath = aiModelsData[0];
    aiModelsData.forEach((model) => {
      if (model.route === pathname) {
        modelAccordingToPath = model;
      }
    });

    return modelAccordingToPath;
  };
  const [secretKeyMyself, setSecretKeyMyself] = useState(null);
  const [publicKeyMyself, setPublicKeyMyself] = useState(null);
  const [message, setMessage] = useState("");
  const [relay, setRelay] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isSelectModelDialogOpen, setIsSelectModelDialogOpen] = useState(false);
  const pathname = usePathname();
  const [selectedAIModel, setSelectedAIModel] = useState(
    selectedAIModelBasedOnPath()
  );
  const [testState, setTestState] = useState(false);
  const [numberOfHeaderBrainIcons, setNumberOfHeaderBrainIcons] = useState(0);

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

      let someArr = [];
      let end = false;

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
              const newMessageText = await decrypt(
                secretKey,
                pk_other,
                event.content
              );

              someArr.push({ ...event, text: newMessageText, isUser: false });

              if (end) {
                setMessageHistory((prev) => [
                  ...prev,
                  { ...event, text: newMessageText, isUser: false },
                ]);

                setTestState((prev) => !prev);
              }
            }
            if (event.pubkey === publicKey && event.tags[0][1] === pk_other) {
              const newMessageText = await decrypt(
                secretKey,
                pk_other,
                event.content
              );
              someArr.push({ ...event, text: newMessageText, isUser: true });

              if (end) {
                setMessageHistory((prev) => [
                  ...prev,
                  { ...event, text: newMessageText, isUser: true },
                ]);
                setTestState((prev) => !prev);
              }
            }
          },
          async oneose() {
            someArr = sortByCreatedAt(someArr);

            setMessageHistory([...someArr, selectedAIModelStatusMessage()]);
            someArr.push(selectedAIModelStatusMessage());

            setTestState((prev) => !prev);
            end = true;
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
      tags: [],
      content: await encrypt(secretKeyMyself, pk_other, message),
    };

    eventTemplate = addTag(eventTemplate, "p", pk_other);
    eventTemplate = addTag(eventTemplate, "model", selectedAIModel?.model);

    const signedEvent = finalizeEvent(
      eventTemplate,
      hexToBytes(secretKeyMyself)
    );

    const res = await relay.publish(signedEvent);

    incrementBainIconInHeaderIfLearningRequested(message);
    setMessage("");
  };

  const incrementBainIconInHeaderIfLearningRequested = (message) => {
    const pattern = /learn this:/i;

    if (pattern.test(message)) {
      setNumberOfHeaderBrainIcons((prev) => {
        if (prev === 3) {
          return prev;
        }

        return prev + 1;
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
      event.preventDefault();
    }
  };

  const addTag = (event, tagKey, tagValue) => {
    return {
      ...event,
      tags: [...event.tags, [tagKey, tagValue]],
    };
  };

  useEffect(() => {}, [testState]);

  useEffect(() => {}, [messageHistory.length]);

  function sortByCreatedAt(arr) {
    if (arr.length === 0) {
      return [];
    }

    return arr.sort((a, b) => a.created_at - b.created_at);
  }

  useEffect(() => {
    setMessageHistory([...messageHistory, selectedAIModelStatusMessage()]);
  }, [selectedAIModel]);

  useEffect(() => {}, [messageHistory.length]);

  useEffect(() => {}, [messageHistory.length]);

  const selectedAIModelStatusMessage = () => {
    return {
      id: "status-message",
      name: selectedAIModel?.name,
      description: selectedAIModel?.description,
    };
  };

  return (
    <div className="font-roboto h-[100vh] max-h-[100vh] flex flex-col justify-between bg-white dark:bg-gray-900">
      <div className="py-4 flex items-center">
        <div
          className="p-2 m-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setIsSelectModelDialogOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.0"
            width="20.000000pt"
            height="20.000000pt"
            viewBox="0 0 500.000000 500.000000"
            preserveAspectRatio="xMidYMid meet"
            className="text-black dark:text-white"
          >
            <g
              transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"
              fill="currentColor"
              stroke="none"
            >
              <path d="M3782 4819 c-267 -32 -476 -133 -663 -319 -143 -143 -233 -298 -286 -495 -30 -109 -42 -335 -24 -439 42 -241 142 -436 311 -607 249 -252 605 -364 961 -303 448 77 812 444 885 894 73 449 -128 884 -521 1122 -182 111 -459 172 -663 147z m218 -109 c327 -37 620 -243 770 -540 187 -371 114 -834 -177 -1125 -24 -25 -49 -45 -54 -45 -5 0 -9 18 -9 39 0 21 -10 70 -21 107 -56 182 -160 310 -321 394 l-68 36 41 33 c94 76 144 199 137 341 -3 73 -9 98 -36 152 -42 87 -110 152 -202 197 -70 33 -81 36 -170 36 -87 -1 -101 -4 -167 -34 -171 -80 -278 -274 -243 -444 18 -86 73 -190 128 -238 25 -21 43 -41 41 -43 -2 -1 -33 -18 -69 -37 -85 -44 -205 -163 -253 -249 -43 -78 -62 -133 -77 -222 -7 -38 -15 -68 -18 -68 -10 0 -104 105 -148 166 -62 87 -120 214 -150 329 -37 143 -37 327 0 470 114 438 491 740 941 754 22 0 78 -4 125 -9z" />
              <path d="M1700 4242 c-30 -10 -39 -37 -40 -113 l0 -75 -128 -12 c-326 -31 -600 -160 -832 -392 -110 -109 -179 -202 -247 -330 -83 -157 -141 -365 -150 -541 -6 -106 -6 -107 20 -124 15 -9 34 -14 45 -11 11 4 41 44 67 89 166 286 436 506 747 608 117 38 296 69 399 69 l79 0 0 -80 c0 -67 3 -83 20 -100 36 -36 -3 -58 420 245 161 116 299 219 306 230 20 30 8 56 -44 93 -26 18 -150 107 -277 197 -126 90 -255 181 -285 203 -62 44 -79 51 -100 44z" />
              <path d="M928 2345 c-397 -67 -735 -361 -856 -745 -154 -488 44 -1009 483 -1272 376 -225 852 -200 1211 65 196 145 344 368 405 615 25 100 29 136 29 254 0 193 -31 333 -111 492 -214 430 -688 671 -1161 591z m423 -124 c376 -98 648 -388 730 -776 7 -33 13 -118 13 -190 -1 -109 -5 -146 -28 -230 -45 -169 -120 -304 -236 -429 -67 -71 -80 -72 -80 -9 0 48 -42 173 -84 246 -19 36 -65 93 -101 128 -63 62 -175 139 -202 139 -22 0 -15 11 41 70 113 119 151 259 106 401 -32 104 -82 173 -168 232 -167 115 -421 80 -544 -76 -50 -62 -65 -88 -82 -147 -45 -152 4 -326 122 -432 l41 -37 -43 -20 c-195 -86 -340 -288 -371 -515 l-7 -48 -35 33 c-19 19 -62 69 -94 113 -136 180 -199 368 -199 595 1 356 181 667 495 853 99 58 197 92 355 122 60 11 297 -3 371 -23z" />
              <path d="M4602 2323 c-10 -16 -31 -50 -47 -78 -78 -139 -265 -336 -405 -428 -218 -142 -482 -227 -711 -227 l-99 0 0 78 c0 64 -4 82 -18 95 -23 21 -60 22 -81 3 -9 -7 -41 -31 -72 -52 -229 -159 -572 -410 -580 -425 -15 -30 6 -63 68 -104 32 -22 143 -101 246 -175 104 -74 198 -142 210 -150 13 -8 52 -36 89 -63 72 -51 83 -55 116 -31 20 14 22 24 22 100 l0 84 68 0 c95 0 235 25 350 61 490 157 838 562 926 1078 9 52 16 127 16 167 0 62 -3 75 -19 84 -33 17 -59 11 -79 -17z" />
            </g>
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
              Contact:{" "}
              <a
                className="decoration-solid underline"
                href="mailto:et@concur.guru"
              >
                et@concur.guru
              </a>
            </div>
          </div>
        </div>

        {numberOfHeaderBrainIcons > 0 && (
          <div className="flex pr-4 pl-1 items-center">
            <p className="px-1">+</p>
            {Array.from({ length: numberOfHeaderBrainIcons }).map(
              (_, index) => (
                <BrainSvg key={index} />
              )
            )}
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-grow justify-end w-full">
        <div className="overflow-y-auto flex-grow justify-end text-black dark:text-gray-100 p-4 max-w-3xl mx-auto w-full">
          {messageHistory.map((message) => {
            return (
              <Message key={message.id + Math.random()} message={message} />
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
