import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import aiModelsData from "../../ai-models.json";
import AddReaction from "../svgs/AddReaction";
import AddReactionDialog from "./AddReactionDialog";
import PencilSvg from "../svgs/PencilSvg";
import RoundArrowsSvg from "../svgs/RoundArrowsSvg";
import Markdown from "react-markdown";
import BrainSvg from "../svgs/BrainSvg";

const Messages = ({
  messageHistory,
  setAddReactionDialogOpenForMessage,
  setIsAddReactionDialogOpen,
  reactionsOfMessages,
  sendDefaultMessageOfAiModel,
  setInputValueForFeedbackIfDislikedMessageIsEdited,
  setFeedbackForMessage,
  bottomOfMessageHistoryList,
  retryAMessage,
  setNumberOfHeaderBrainIcons,
  numberOfHeaderBrainIcons,
  selectedAIModel,
}) => {
  let isMessageFromBot = false;
  let alreadyGaveWarning = false;

  return (
    <div className="overflow-y-auto flex-grow justify-end text-black dark:text-gray-100 p-4 max-w-3xl mx-auto w-full">
      {messageHistory?.map((message, index) => {
        let returnValue = null;
        if (message?.id === "status-message") {
          returnValue = (
            <StatusMessage
              key={message.id + Math.random()}
              message={message}
              sendDefaultMessageOfAiModel={sendDefaultMessageOfAiModel}
            />
          );
        } else if (message?.id === "ai-can-hallucinate-message") {
          returnValue = (
            <div className="font-roboto font-light pl-6">
              AI can hallucinate and make mistakes. You should double check and
              compare the answers that you get here with a credible source
              before acting on them.
            </div>
          );
        } else if (message?.isUser) {
          returnValue = (
            <MyMessage
              message={message}
              key={message.id}
              setNumberOfHeaderBrainIcons={setNumberOfHeaderBrainIcons}
              numberOfHeaderBrainIcons={numberOfHeaderBrainIcons}
            />
          );
        } else {
          isMessageFromBot = true;

          returnValue = (
            <TheirMessage
              key={message.id}
              message={message}
              setAddReactionDialogOpenForMessage={
                setAddReactionDialogOpenForMessage
              }
              setIsAddReactionDialogOpen={setIsAddReactionDialogOpen}
              reaction={reactionsOfMessages[message?.id]}
              setInputValueForFeedbackIfDislikedMessageIsEdited={
                setInputValueForFeedbackIfDislikedMessageIsEdited
              }
              setFeedbackForMessage={setFeedbackForMessage}
              retryAMessage={retryAMessage}
            />
          );
        }

        return returnValue;
      })}

      <div ref={bottomOfMessageHistoryList}></div>
    </div>
  );
};

const MyMessage = ({
  message,
  setNumberOfHeaderBrainIcons,
  numberOfHeaderBrainIcons,
}) => {
  const incrementBrainIconInHeaderIfLearningRequested = () => {
    setNumberOfHeaderBrainIcons((prev) => {
      if (prev === 5) {
        return prev;
      }

      return prev + 1;
    });
  };

  const messageIsALearningRequest = useMemo(() => {
    const pattern = /learn this:/i;
    const res = pattern.test(message?.text);

    return res;
  }, []);

  useEffect(() => {
    if (messageIsALearningRequest) {
      incrementBrainIconInHeaderIfLearningRequested();
    }
  }, []);

  return (
    <div className="flex flex-row-reverse my-2">
      <div className="flex flex-col items-end justify-between">
        <div className="font-light text-sm px-2 text-gray-600 dark:text-gray-300">
          {"You"}
        </div>
        <pre className="break-words whitespace-pre-wrap font-roboto w-fit max-w-xl font-light p-3 min-h-12 mt-1 rounded-2xl min-h-12 bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-100">
          {message?.text}
        </pre>
        {messageIsALearningRequest && (
          <div className="text-lg self-end px-1 border rounded-2xl border-[#F4F4F5] dark:border-[#18181B] -top-2 -left-2 relative bg-gray-100 dark:bg-gray-700">
            <p className="p-0 m-0">
              <BrainSvg />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const messageAIModel = (message) => {
  if (message.tags && Array.isArray(message.tags)) {
    for (let tag of message.tags) {
      if (tag[0] === "model") {
        return tag[1];
      }
    }
  }
  return null;
};

const messageAIModelName = (message) => {
  let aIModelOfMessage = messageAIModel(message);

  let nameOfAiModelOfMessage = aiModelsData.find(
    (model) => model.model === aIModelOfMessage
  )?.name;

  if (!nameOfAiModelOfMessage) {
    nameOfAiModelOfMessage = aiModelsData[0].name;
  }

  return nameOfAiModelOfMessage;
};

const messageAIModelImage = (message) => {
  let aIModelOfMessage = messageAIModel(message);
  let imageOfAiModelOfMessage = aiModelsData.find(
    (model) => model.model === aIModelOfMessage
  )?.image;

  if (!imageOfAiModelOfMessage) {
    imageOfAiModelOfMessage = aiModelsData[0].image;
  }

  return imageOfAiModelOfMessage;
};

const TheirMessage = ({
  message,
  setAddReactionDialogOpenForMessage,
  setIsAddReactionDialogOpen,
  reaction,
  setInputValueForFeedbackIfDislikedMessageIsEdited,
  setFeedbackForMessage,
  retryAMessage,
}) => {
  return (
    <div className="flex my-2">
      <div className="w-[20px] h-[20px] min-w-[20px]">
        <Image
          className="rounded-full w-[20px] h-[20px] object-cover"
          height={20}
          width={20}
          src={messageAIModelImage(message)}
          alt={"Bot Picture"}
        />
      </div>
      <div className="flex flex-col justify-between">
        <div className="font-light flex text-sm px-2 text-gray-600 dark:text-gray-300 justify-between items-center">
          <div>{messageAIModelName(message)}</div>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-start relative">
            <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-100 relative">
              <Markdown className="whitespace-pre-wrap break-words w-fit max-w-xl font-roboto">
                {message?.text}
              </Markdown>
              {reaction?.content === "👎" && (
                <div className="absolute bottom-0 right-0 top-0 left-0 h-full w-full dark:bg-gray-800/[0.8] bg-gray-200/[0.8] rounded-2xl flex justify-around items-center">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setInputValueForFeedbackIfDislikedMessageIsEdited(
                        message
                      );
                      setFeedbackForMessage(message);
                    }}
                  >
                    <PencilSvg />
                    <div className="ml-2">Edit</div>
                  </div>
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      retryAMessage(message);
                    }}
                  >
                    <RoundArrowsSvg />
                    <div className="ml-2">Retry</div>
                  </div>
                </div>
              )}
            </div>
            {reaction?.content && (
              <div className="text-lg self-end px-1 border rounded-2xl border-[#F4F4F5] dark:border-[#18181B] -top-2 -left-2 relative bg-gray-100 dark:bg-gray-700">
                <p className="p-0 m-0">{reaction?.content}</p>
              </div>
            )}
          </div>
          {!reaction?.content && !message?.isAThinkingMessageFromABot && (
            <div
              className="ml-2"
              onClick={() => {
                setAddReactionDialogOpenForMessage(message);
                setIsAddReactionDialogOpen(true);
              }}
            >
              <AddReaction />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusMessage = ({ message, sendDefaultMessageOfAiModel }) => {
  return (
    <div className="w-full flex flex-col items-center mt-6 mt-4">
      <div className="mb-4">You are talking to: {message.name}</div>
      <div className="h-[60px] w-[60px] min-w-[60px]">
        <Image
          className="rounded-full w-[60px] h-[60px] object-cover"
          height={60}
          width={60}
          src={message.image}
          alt={"Bot Picture"}
        />
      </div>

      <div className="flex flex-col items-center w-full mt-4">
        <div className="text-md py-1 text-center font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto dark:text-gray-200">
          Speciality: {message.description}
        </div>
        {message.questions.map((question, index) => (
          <div
            key={index}
            className="text-md cursor-pointer my-2 self-start w-full text-black dark:text-white p-1 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-start hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => {
              sendDefaultMessageOfAiModel(question);
            }}
          >
            <div className="h-8 w-8 p-4 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700">
              ?
            </div>
            <div className="ml-2 py-1">{question}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
