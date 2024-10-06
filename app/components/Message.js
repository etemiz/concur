import React, { useState } from "react";
import Image from "next/image";
import aiModelsData from "../../ai-models.json";
import AddReaction from "../svgs/AddReaction";
import AddReactionDialog from "./AddReactionDialog";
const Message = ({
  message,
  setAddReactionDialogOpenForMessage,
  setIsAddReactionDialogOpen,
  reaction,
  sendDefaultMessageOfAiModel,
}) => {
  if (message?.id === "status-message") {
    return (
      <StatusMessage
        message={message}
        sendDefaultMessageOfAiModel={sendDefaultMessageOfAiModel}
      />
    );
  } else {
    if (message?.isUser) {
      return <MyMessage message={message} />;
    } else {
      return (
        <TheirMessage
          message={message}
          setAddReactionDialogOpenForMessage={
            setAddReactionDialogOpenForMessage
          }
          setIsAddReactionDialogOpen={setIsAddReactionDialogOpen}
          reaction={reaction}
        />
      );
    }
  }
};

const Messages = ({
  messageHistory,
  messageInputFieldRef,
  setAddReactionDialogOpenForMessage,
  setIsAddReactionDialogOpen,
  reactionsOfMessages,
  sendDefaultMessageOfAiModel,
  setInputValueForFeedbackIfDislikedMessageIsEdited,
  setFeedbackForMessage,
}) => {
  console.log(messageHistory);
  return (
    <div className="overflow-y-auto flex-grow justify-end text-black dark:text-gray-100 p-4 max-w-3xl mx-auto w-full">
      {messageHistory?.map((message) => {
        if (message?.id === "status-message") {
          return (
            <StatusMessage
              key={message.id}
              message={message}
              sendDefaultMessageOfAiModel={sendDefaultMessageOfAiModel}
            />
          );
        } else {
          if (message?.isUser) {
            return <MyMessage message={message} key={message.id} />;
          } else {
            return (
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
              />
            );
          }
        }
      })}
      <div
        className="bg-transparent"
        style={{ height: messageInputFieldRef?.current?.offsetHeight + 60 }}
      ></div>
    </div>
  );
};

const MyMessage = ({ message }) => {
  return (
    <div className="flex flex-row-reverse my-2">
      <div className="flex flex-col items-end justify-between">
        <div className="font-light text-sm px-2 text-gray-600 dark:text-gray-300">
          {"You"}
        </div>
        <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-100">
          {message?.text}
        </div>
      </div>
    </div>
  );
};

const TheirMessage = ({
  message,
  setAddReactionDialogOpenForMessage,
  setIsAddReactionDialogOpen,
  reaction,
  setInputValueForFeedbackIfDislikedMessageIsEdited,
  setFeedbackForMessage,
}) => {
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

  return (
    <div className="flex my-2">
      <div className="w-[20px] h-[20px] min-w-[20px]">
        <Image
          className="rounded-full w-[20px] h-[20px]"
          style={{ width: "20px !important", height: "20px !important" }}
          height={20}
          width={20}
          src={"/BotPic.png"}
          alt={"Bot Picture"}
        />
      </div>
      <div className="flex flex-col justify-between">
        <div className="font-light flex text-sm px-2 text-gray-600 dark:text-gray-300 justify-between items-center">
          <div>{messageAIModelName(message)}</div>
          {reaction?.content === "👎" && (
            <div
              onClick={() => {
                setInputValueForFeedbackIfDislikedMessageIsEdited(message);
                setFeedbackForMessage(message);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-[#6b7280] dark:stroke-white"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="m3.99 16.854-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63 1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-start relative">
            <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-100">
              {message?.text}
            </div>
            {reaction?.content && (
              <div className="text-lg self-end px-1 border-2 rounded-2xl border-[#F4F4F5] dark:border-[#18181B] -top-2 -left-2 relative bg-gray-100 dark:bg-gray-700">
                <p className="p-0 m-0">{reaction?.content}</p>
              </div>
            )}
          </div>
          {!reaction?.content && (
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
      <div className="h-[60px] w-[60px] mt-4">
        <Image
          src="/BotPic.png"
          width={60}
          height={60}
          alt="Potrait of an Ostrich"
          style={{ borderRadius: "50%" }}
        />
      </div>

      <div className="flex flex-col items-center w-full mt-4">
        <div className="text-md py-1 text-center font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto dark:text-gray-200">
          {message.name} {message.description}
        </div>
        {message.questions.map((question, index) => (
          <div
            key={index}
            className="text-md my-2 self-start w-full text-black dark:text-white p-1 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-start hover:scale-[1.02]"
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
