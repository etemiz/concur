"use client";
import Image from "next/image";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import Markdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import { useMemo } from "react";
import { extractEValue } from "../helpers/nip4Helpers";

const ShareAMessageDialog = ({
  isShareAMessageDialogOpen,
  setIsShareAMessageDialogOpen,
  handleShareAMessage,
  addReactionDialogOpenForMessage,
  sorted,
  textToBeShared,
  setTextToBeShared,
}) => {
  function findObjectById(array, id) {
    if (!Array.isArray(array) || !id) {
      return null;
    }
    return array.find((item) => item.id === id) || null;
  }

  const shareableContent = useMemo(() => {
    try {
      // Extract the event ID
      const extractedEventIdOfWhichMessageIsAReplyOf = extractEValue(
        addReactionDialogOpenForMessage
      );
      if (!extractedEventIdOfWhichMessageIsAReplyOf) {
        throw new Error("Invalid extracted event ID.");
      }

      // Find the corresponding question object
      const question = findObjectById(
        sorted.array,
        extractedEventIdOfWhichMessageIsAReplyOf
      );
      if (!question || typeof question.text !== "string") {
        throw new Error("Question not found or invalid.");
      }

      // Extract the answer
      const answerText = addReactionDialogOpenForMessage?.text;
      if (typeof answerText !== "string") {
        throw new Error("Answer text is invalid.");
      }

      // Construct the parts
      const questionPart = "Question: " + question.text;
      const answerPart = "Answer: " + answerText;

      const res = questionPart + "\n\n" + answerPart;

      setTextToBeShared(res);

      return res;
    } catch (error) {
      // Log the error for debugging if needed
      console.error("Error generating shareable content:", error);

      // Default to empty strings
      return "Question: \n\nAnswer: ";
    }
  }, [addReactionDialogOpenForMessage?.text]);

  return (
    <>
      <Dialog
        open={isShareAMessageDialogOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => setIsShareAMessageDialogOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed dark:bg-white/30 bg-gray-800 inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="max-w-md rounded-xl w-full h-full min-h-full bg-white dark:bg-gray-800 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              {/* <Markdown className="whitespace-pre-wrap break-words w-fit max-w-xl font-roboto">
                {addReactionDialogOpenForMessage?.text}
              </Markdown> */}
              <div className="w-full h-[80vh] min-h-full flex flex-col">
                <TextareaAutosize
                  // minRows={1}
                  onChange={(e) => setTextToBeShared(e.target.value)}
                  value={textToBeShared}
                  className="dark:bg-[#111827] max-h-[80vh] flex-1 p-2 w-full text-black dark:text-gray-100 rounded-[1.875rem] border border-gray-300 dark:border-gray-600 resize-none"
                />

                <div className="flex justify-around gap-4">
                  <button
                    onClick={() => setIsShareAMessageDialogOpen(false)}
                    className="px-4 py-3 w-full mt-4 font-roboto font-light text-xl text-white dark:text-black bg-black dark:bg-gray-300 
             hover:bg-gray-700 hover:dark:bg-gray-400 
             active:bg-gray-900 active:dark:bg-gray-500 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-3 mt-4 w-full font-roboto font-light text-xl text-white dark:text-black bg-black dark:bg-gray-300 
             hover:bg-gray-700 hover:dark:bg-gray-400 
             active:bg-gray-900 active:dark:bg-gray-500 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleShareAMessage}
                  >
                    Share
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ShareAMessageDialog;
