import React from "react";
import Image from "next/image";
import aiModelsData from "../../ai-models.json";
const Message = ({ message }) => {
  if (message?.id === "status-message") {
    return <StatusMessage message={message} />;
  } else {
    if (message?.isUser) {
      return <MyMessage message={message} />;
    } else {
      return <TheirMessage message={message} />;
    }
  }
};

const MyMessage = ({ message }) => {
  return (
    <div className="flex flex-row-reverse my-2">
      <div className="w-[20px] h-[20px] min-w-[30px]">
        <Image
          className="rounded-full"
          height={20}
          width={20}
          src={"/Y.png"}
          alt={"Your Picture"}
        />
      </div>
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

const TheirMessage = ({ message }) => {
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
        <div className="font-light text-sm px-2 text-gray-600 dark:text-gray-300">
          {messageAIModelName(message)}
        </div>
        <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-100">
          {message?.text}
        </div>
      </div>
    </div>
  );
};

const StatusMessage = ({ message }) => {
  return (
    <div className="w-full flex flex-col items-center mt-6 mb-4">
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
          {message.name} {message.description}
        </div>
        <a
          className="text-[13px] text-[#6b6b6b] dark:text-gray-400 py-1 underline decoration-solid"
          href="mailto:et@concur.guru"
        >
          et@concur.guru
        </a>
      </div>
    </div>
  );
};

export default Message;
