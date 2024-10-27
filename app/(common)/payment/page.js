import React from "react";
import Link from "next/link";
import GoldenText from "../../components/GoldenText";

const Payment = () => {
  return (
    <div className="w-full px-2 font-roboto">
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
        <h1 className="font-roboto py-7 text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold text-center text-gray-800 dark:text-gray-300">
          Access Types
        </h1>
        <div className="h-[25px] w-[25px]"></div>
      </div>
      <div className="flex justify-center">
        <div className="bg-white/70 dark:bg-black/20 rounded-xl border dark:border-gray-600 p-2 w-full m-1 max-w-xl">
          <div className="p-1 text-xl text-center">Free</div>
          <div className="p-1 font-roboto font-light">- Dumb AI</div>
          <div className="p-1 font-roboto font-light">
            - Questions Wait In line
          </div>
          <div className="p-1 font-roboto font-light">
            - Slow answer Generations
          </div>
        </div>
        <div className="bg-white/70 dark:bg-black/20 rounded-xl border dark:border-gray-600 p-2 w-full m-1 max-w-xl">
          <div className="w-full flex items-center justify-center mt-1">
            <img
              src={"/goldenBrain.png"}
              alt="Golden Brain"
              className="h-6"
              style={{ borderRadius: "50%" }}
            />
          </div>
          <div className="px-1 text-xl text-center">
            <GoldenText>Golden Brain Badge</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText>- Smarter AI</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText>- Unlimited Questions</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText>- Faster Answers</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText>- No Queue</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText>- Supporting a Good Cause</GoldenText>
          </div>
          <div className="p-1 font-roboto font-normal">
            <GoldenText> - Getting Support From Team</GoldenText>
          </div>
          <div className="w-full p-1">
            <Link
              href="/about"
              className="inline-block flex items-center justify-center w-full px-4 py-3 font-roboto font-normal text-xl text-white dark:text-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600"
            >
              Buy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
