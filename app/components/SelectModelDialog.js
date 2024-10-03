"use client";
import data from "../../ai-models.json";
import Image from "next/image";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";

export default function SelectModelDialog({
  isSelectModelDialogOpen,
  setIsSelectModelDialogOpen,
  setSelectedAIModel,
}) {
  return (
    <>
      <Dialog
        open={isSelectModelDialogOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => setIsSelectModelDialogOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed dark:bg-white/30 bg-gray-800 inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800  p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              {data.map((aiModel) => (
                <div
                  key={aiModel.name}
                  className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => {
                    setIsSelectModelDialogOpen(false);
                    setSelectedAIModel(aiModel);
                    window.history.pushState(null, "", aiModel.route);
                  }}
                >
                  <div className="h-[35px] w-[35px]">
                    <Image
                      src="/BotPic.png"
                      width={35}
                      height={35}
                      alt="Portrait of an Ostrich"
                      style={{ borderRadius: "50%" }}
                    />
                  </div>

                  <div className="flex flex-col ml-4">
                    <div className="text-md font-semibold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal font-roboto text-gray-900 dark:text-gray-200">
                      {aiModel.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {aiModel.description}
                    </div>
                  </div>
                  <div className="px-2"></div>
                </div>
              ))}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
