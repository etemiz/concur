"use client";
import react, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Messages from "../components/Message";
import TextareaAutosize from "react-textarea-autosize";
import SelectModelDialog from "../components/SelectModelDialog";
import {
  convertNostrPublicKeyToHex,
  generatedOrSavedClientKeys,
  decryptAndAddBotMessageToMessageHistory,
  decryptAndAddMyMessageToMessageHistory,
  handleReactionForAMessageRecieved,
  isMessageAFeedbackOfBotsResponse,
  makeAFeedbackMessageEventAndPublishToRelayPoolAndClearMessageInputField,
  makeANormalMessageEventAndPublishToRelayPoolAndClearMessageInputField,
  addTag,
  sendARetryMessage,
  makeAndPublishAReactionEvent,
  isAThinkingMessageFromABot,
  handleThinkingMessageFromABot,
  generateNewClientKeysAndSaveThem,
} from "../helpers/nip4Helpers";
import aiModelsData from "../../ai-models.json";
import BrainSvg from "../svgs/BrainSvg";
import { usePathname } from "next/navigation";
import { SimplePool } from "nostr-tools/pool";
import settings from "../../settings.json";
import SortedArray from "sorted-array";
import AddReactionDialog from "../components/AddReactionDialog";
import AboutIcon from "../svgs/AboutIcon";
import AddIcon from "../svgs/AddIcon";
import Link from "next/link";
import { useParams, redirect } from "next/navigation";
import {
  getCookieValue,
  moreThanThreeMinutesHavePassed,
  makeAiCanHallucinateMessage,
  moreThanAWeekHasPassedSinceLastWarning,
} from "../helpers/commonHelper";
import {
  getAiCanHalucinateMessageFromLocalStorage,
  saveAiCanHalucinateMessageToLocalStorage,
} from "../helpers/localStorageHelper";

let pk_other =
  "npub1chadadwep45t4l7xx9z45p72xsxv7833zyy4tctdgh44lpc50nvsrjex2m";
// pk_other = "622f2238d33cf54d8c6181a3475e69e9556df60bb57cbf157fd1ea06eeda41de";
pk_other = convertNostrPublicKeyToHex(pk_other);
var sorted = new SortedArray([], (a, b) => a.created_at - b.created_at);
let pool = new SimplePool();
let aiCanHallucinateMessageAdded = false;
let isUserConversingWithBot = false;
const uniqueEvents = new Set();

export default function MyLayout() {
  const premiumUserCookieValue = useMemo(() => getCookieValue("gold-ex"), []);

  const params = useParams();

  function routeExists(value, dataArray) {
    return dataArray.some((item) => item.route === value);
  }

  if (params.slug && !routeExists("/" + params.slug, aiModelsData)) {
    redirect(`/not-found`);
  }

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
  const [messageHistory, setMessageHistory] = useState([]);
  const [isSelectModelDialogOpen, setIsSelectModelDialogOpen] = useState(false);
  const pathname = usePathname();
  const [selectedAIModel, setSelectedAIModel] = useState(
    selectedAIModelBasedOnPath()
  );
  const [numberOfHeaderBrainIcons, setNumberOfHeaderBrainIcons] = useState(0);
  const [relayPool, setRelayPool] = useState();
  const [connectionGotCutOff, setConnectionGotCutOff] = useState(false);
  const [isAddReactionDialogOpen, setIsAddReactionDialogOpen] = useState(false);
  const [addReactionDialogOpenForMessage, setAddReactionDialogOpenForMessage] =
    useState(null);
  const [feedbackForMessage, setFeedbackForMessage] = useState(null);
  const [reactionsOfMessages, setReactionsOfMessages] = useState({});

  const listOfRelays = settings.listOfRelays;

  const messageInputFieldRef = useRef();

  const bottomOfMessageHistoryList = useRef(null);

  useEffect(() => {
    let { secretKey, publicKey } = generatedOrSavedClientKeys();

    setSecretKeyMyself(secretKey);
    setPublicKeyMyself(publicKey);

    recieveAndSetMessageHistory(null, secretKey, publicKey);

    updateLastRunTime()
  }, []);

  const recieveAndSetMessageHistory = (
    created_at_time,
    secretKeyParam,
    publicKeyParam
  ) => {
    let secretKey = "";
    let publicKey = "";

    if (secretKeyParam && publicKeyParam) {
      secretKey = secretKeyParam;
      publicKey = publicKeyParam;
    } else {
      secretKey = secretKeyMyself;
      publicKey = publicKeyMyself;
    }

    setConnectionGotCutOff(false);

    relayPool?.close();

    let currentTimeInUnixSeconds;

    if (created_at_time) {
      currentTimeInUnixSeconds = created_at_time;
    } else {
      currentTimeInUnixSeconds = null;
    }

    let h = pool.subscribeMany(
      listOfRelays,
      [
        {
          kinds: [4, 7],
          authors: [pk_other, publicKey],
        },
      ],
      {
        async onevent(event) {
          // console.log(event);

          if (uniqueEvents.has(event.id)) return;

          uniqueEvents.add(event.id);

          if (
            currentTimeInUnixSeconds &&
            event.created_at < currentTimeInUnixSeconds
          )
            return;

          if (event.kind == 7) {
            if (isAThinkingMessageFromABot(event, publicKey, pk_other)) {
              handleThinkingMessageFromABot(sorted, event, setMessageHistory);
            }

            if (event.pubkey === publicKey && event.tags[0][1] === pk_other) {
              handleReactionForAMessageRecieved(event, setReactionsOfMessages);
            }

            return;
          }

          if (event.pubkey === pk_other && event.tags[0][1] === publicKey) {
            decryptAndAddBotMessageToMessageHistory(
              event,
              secretKey,
              pk_other,
              sorted,
              setMessageHistory
            );
            if (!aiCanHallucinateMessageAdded && isUserConversingWithBot) {
              aiCanHallucinateMessageAdded = true;
              const res = aiCanHallucinateMessage(event.created_at + 1);
              if (res) {
                sorted.insert(res);
                setMessageHistory([...sorted.array]);
              }
            }
          }
          if (event.pubkey === publicKey && event.tags[0][1] === pk_other) {
            decryptAndAddMyMessageToMessageHistory(
              event,
              secretKey,
              pk_other,
              sorted,
              setMessageHistory
            );
          }
        },
        async oneose() {},
        onclose(reason) {
          // console.log("relay got diconnected");
          // console.log(reason);
        },
      }
    );

    setRelayPool(h);
  };

  function checkLastRunAndExecute() {
    const lastRunKey = "lastRunTime";

    const currentTime = new Date();

    const lastRunTime = localStorage.getItem(lastRunKey)
      ? new Date(localStorage.getItem(lastRunKey))
      : null;

    if (!lastRunTime || currentTime - lastRunTime > 2 * 60 * 1000) {
      pool.destroy();

      recieveAndSetMessageHistory(
        Math.floor(Date.now() / 1000),
        secretKeyMyself,
        publicKeyMyself
      );

      localStorage.setItem(lastRunKey, currentTime.toISOString());
    } else {
    }
  }

  function updateLastRunTime() {
    const lastRunKey = "lastRunTime";
    const currentTime = new Date();

    localStorage.setItem(lastRunKey, currentTime.toISOString());
  }

  useEffect(() => {
    return () => relayPool?.close();
  }, []);

  const sendMessage = async () => {
    checkLastRunAndExecute();
    isUserConversingWithBot = true;

    if (message.length === 0 || message.trim().length === 0 || message === "")
      return;

    if (isMessageAFeedbackOfBotsResponse(message)) {
      makeAFeedbackMessageEventAndPublishToRelayPoolAndClearMessageInputField(
        publicKeyMyself,
        secretKeyMyself,
        pk_other,
        message,
        feedbackForMessage,
        connectionGotCutOff,
        recieveAndSetMessageHistory,
        pool,
        listOfRelays,
        setMessage,
        setConnectionGotCutOff,
        selectedAIModel,
        premiumUserCookieValue
      );
    } else {
      makeANormalMessageEventAndPublishToRelayPoolAndClearMessageInputField(
        publicKeyMyself,
        secretKeyMyself,
        pk_other,
        message,
        connectionGotCutOff,
        recieveAndSetMessageHistory,
        pool,
        listOfRelays,
        setMessage,
        setConnectionGotCutOff,
        selectedAIModel,
        premiumUserCookieValue,
        uniqueEvents,
        setMessageHistory,
        sorted
      );
    }
  };

  const sendDefaultMessageOfAiModel = (message) => {
    makeANormalMessageEventAndPublishToRelayPoolAndClearMessageInputField(
      publicKeyMyself,
      secretKeyMyself,
      pk_other,
      message,
      connectionGotCutOff,
      recieveAndSetMessageHistory,
      pool,
      listOfRelays,
      setMessage,
      setConnectionGotCutOff,
      selectedAIModel,
      premiumUserCookieValue,
      uniqueEvents,
      setMessageHistory,
      sorted
    );

    checkLastRunAndExecute();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
      event.preventDefault();
    }
  };

  useEffect(() => {}, [messageHistory.length]);

  useEffect(() => {
    sorted.insert(selectedAIModelStatusMessage());
    setMessageHistory([...messageHistory, selectedAIModelStatusMessage()]);
  }, [selectedAIModel]);

  const selectedAIModelStatusMessage = () => {
    const selectedAIModelCreatedAt = Math.floor(Date.now() / 1000);

    return {
      id: "status-message",
      name: selectedAIModel?.name,
      description: selectedAIModel?.description,
      questions: selectedAIModel?.questions,
      created_at: selectedAIModelCreatedAt,
      image: selectedAIModel?.image,
      isAThinkingMessageFromABot: false,
      isReferencingTheMessage: "",
    };
  };

  const handleReactionOnMessage = async (reaction) => {
    checkLastRunAndExecute();

    makeAndPublishAReactionEvent(
      reaction,
      publicKeyMyself,
      pk_other,
      addReactionDialogOpenForMessage,
      secretKeyMyself,
      pool,
      listOfRelays,
      connectionGotCutOff,
      recieveAndSetMessageHistory,
      setConnectionGotCutOff,
      premiumUserCookieValue
    );
  };

  const setInputValueForFeedbackIfDislikedMessageIsEdited = (message) => {
    setMessage(`Preferred answer: ${message?.text}`);
  };

  const scrollToBottomOfMessageHistoryList = () => {
    if (bottomOfMessageHistoryList.current) {
      bottomOfMessageHistoryList.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottomOfMessageHistoryList();
  }, [messageHistory]);

  const retryAMessage = async (selectedMessage) => {
    checkLastRunAndExecute();

    sendARetryMessage(
      publicKeyMyself,
      secretKeyMyself,
      pk_other,
      selectedMessage?.id,
      connectionGotCutOff,
      recieveAndSetMessageHistory,
      pool,
      listOfRelays,
      setMessage,
      setConnectionGotCutOff,
      selectedAIModel,
      premiumUserCookieValue
    );
  };

  const handleNewChatIconClick = () => {
    pool.destroy();

    let { secretKey, publicKey } = generateNewClientKeysAndSaveThem();

    setSecretKeyMyself(secretKey);
    setPublicKeyMyself(publicKey);
    sorted.array = [selectedAIModelStatusMessage()];
    setMessageHistory([selectedAIModelStatusMessage()]);
    recieveAndSetMessageHistory(null, secretKey, publicKey);
  };

  const aiCanHallucinateMessage = (time_for_ai_can_hallucinate_message) => {
    let res = getAiCanHalucinateMessageFromLocalStorage();

    if (res) {
      if (moreThanAWeekHasPassedSinceLastWarning(res)) {
        res.created_at = Math.floor(Date.now() / 1000) + 1;
        saveAiCanHalucinateMessageToLocalStorage(res);

        return res;
      }
      // return res;
    } else {
      res = makeAiCanHallucinateMessage(time_for_ai_can_hallucinate_message);
      saveAiCanHalucinateMessageToLocalStorage(res);

      return res;
    }
  };

  return (
    <div className="font-roboto h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-white dark:bg-gray-900">
      <div className="py-4 flex items-center justify-between">
        <div className="h-full flex items-center">
          <div
            className="p-2 m-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setIsSelectModelDialogOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
              width="1.25rem"
              height="1.25rem"
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
                src={selectedAIModel.image}
                width={35}
                height={35}
                className="w-[35px] h-[35px] object-cover"
                alt="Potrait of an Ostrich"
                style={{ borderRadius: "50%", maxWidth: "none" }}
              />
            </div>

            <div className="flex flex-col ml-4">
              <div className="text-md font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto dark:text-gray-200 flex items-center justify-start">
                <span>
                  <BrainSvg />
                </span>
                <span className="ml-2">{"Pick a Brain"}</span>
              </div>
            </div>
          </div>

          {numberOfHeaderBrainIcons > 0 && (
            <div className="flex pl-1 items-center flex-wrap">
              <p className="px-1">+</p>
              {Array.from({ length: numberOfHeaderBrainIcons }).map(
                (_, index) => (
                  <BrainSvg key={index} />
                )
              )}
            </div>
          )}
        </div>
        <div className="h-full flex items-center justify-end">
          <Link
            href={"/about"}
            className="p-2 pl-0 my-1 rounded-full transition-colors duration-200 cursor-pointer"
          >
            <AboutIcon />
          </Link>
          <div
            onClick={handleNewChatIconClick}
            className="p-2 my-1 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
          >
            <AddIcon />
          </div>
        </div>
      </div>

      {
        <Messages
          messageHistory={messageHistory}
          messageInputFieldRef={messageInputFieldRef}
          setAddReactionDialogOpenForMessage={
            setAddReactionDialogOpenForMessage
          }
          setIsAddReactionDialogOpen={setIsAddReactionDialogOpen}
          reactionsOfMessages={reactionsOfMessages}
          sendDefaultMessageOfAiModel={sendDefaultMessageOfAiModel}
          setInputValueForFeedbackIfDislikedMessageIsEdited={
            setInputValueForFeedbackIfDislikedMessageIsEdited
          }
          setFeedbackForMessage={setFeedbackForMessage}
          bottomOfMessageHistoryList={bottomOfMessageHistoryList}
          retryAMessage={retryAMessage}
          numberOfHeaderBrainIcons={numberOfHeaderBrainIcons}
          setNumberOfHeaderBrainIcons={setNumberOfHeaderBrainIcons}
          selectedAIModel={selectedAIModel}
        />
      }

      <div className="w-full px-4 pb-3 bottom-0 bg-[#FFFFFF] dark:bg-[#111827]">
        <div className="flex rounded-[1.875rem] max-w-3xl mx-auto items-center p-3 text-black dark:text-gray-100 w-full border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800">
          <TextareaAutosize
            className="w-full border-none bg-transparent dark:bg-transparent focus:outline-none focus:ring-0 resize-none"
            minRows={1}
            maxRows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message here..."
            onKeyDown={handleKeyDown}
            ref={messageInputFieldRef}
          />

          <button
            disabled={!message}
            onClick={sendMessage}
            className="self-end p-2 rounded-full h-10 w-10 bg-black dark:bg-white flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              height="1.25rem"
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
        premiumUserCookieValue={premiumUserCookieValue}
      />
      <AddReactionDialog
        isAddReactionDialogOpen={isAddReactionDialogOpen}
        setIsAddReactionDialogOpen={setIsAddReactionDialogOpen}
        handleReactionOnMessage={handleReactionOnMessage}
      />
    </div>
  );
}
