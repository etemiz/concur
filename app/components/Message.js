import React from "react";
import Image from "next/image";

const Message = ({ message, isUser, imageSource, name }) => {

  if (isUser) {
    return (
      <div className="flex flex-row-reverse my-2">
        <div className="w-[20px] h-[20px] min-w-[30px]">
          <Image className="rounded-full" height={20} width={20} src={imageSource} />
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="font-light text-sm px-2 text-gray-600 dark:text-gray-300">{name}</div>
          <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-100">
            {message}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex my-2">
        <div className="w-[20px] h-[20px] min-w-[20px]">
          <Image className="rounded-full w-[20px] h-[20px]" style={{ width: "20px !important", height: "20px !important" }} height={20} width={20} src={imageSource} />
        </div>
        <div className="flex flex-col justify-between">
          <div className="font-light text-sm px-2 text-gray-600 dark:text-gray-300">{name}</div>
          <div className="font-light p-3 min-h-12 mt-1 max-w-xl rounded-2xl w-fit min-h-12 bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-100">
            {message}
          </div>
        </div>
      </div>
    );
  }
};

export default Message;
