import React, { useState } from "react";
import Markdown from "react-markdown";
import PlusSvg from "../svgs/PlusSvg";
import MinusSvg from "../svgs/MinusSvg";
const CollapsibleList = ({ items, sendDefaultMessageOfAiModel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) {
    return <p>No items to display.</p>;
  }

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="mx-auto">
      <ul className="space-y-2 flex items-center">
        <div className="mb-1 flex items-center">
          <li
            onClick={() => sendDefaultMessageOfAiModel(items[0])}
            className="border max-w-xl rounded-2xl dark:border-slate-500 hover:dark:bg-slate-500 hover:bg-slate-100 cursor-pointer p-2 flex justify-between items-center"
          >
            <Markdown className="whitespace-pre-wrap break-words w-fit max-w-xl font-roboto">
              {items[0]}
            </Markdown>
          </li>
          {items.length > 1 && (
            <div onClick={handleToggle} className="ml-2">
              {isExpanded ? <MinusSvg /> : <PlusSvg />}
            </div>
          )}
        </div>
      </ul>

      <ul
        className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-screen" : "max-h-0"
        }`}
      >
        {items.slice(1).map((item, index) => (
          <li
            key={index}
            className={` max-w-xl border rounded-2xl dark:border-slate-500 hover:dark:bg-slate-500 hover:bg-slate-100 cursor-pointer p-2 flex justify-between items-center mb-1 transform w-fit ${
              isExpanded
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2"
            } transition-all duration-300 ease-in-out delay-${index * 100}`}
            onClick={() => sendDefaultMessageOfAiModel(item)}
          >
            <Markdown className="whitespace-pre-wrap break-words w-fit max-w-xl font-roboto">
              {item}
            </Markdown>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollapsibleList;
