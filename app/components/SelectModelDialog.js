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
import { useRouter } from "next/navigation";

export default function SelectModelDialog({
  isSelectModelDialogOpen,
  setIsSelectModelDialogOpen,
  setSelectedAIModel,
  premiumUserCookieValue,
}) {
  const router = useRouter();
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
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto flex items-center justify-center">
          <div className="flex h-[80vh] items-center justify-center p-4 py-16">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl h-full overflow-y-scroll bg-white dark:bg-gray-800  p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              {data.map((aiModel) => (
                <div
                  key={aiModel.name}
                  className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => {
                    if (aiModel?.premium && !premiumUserCookieValue) {
                      router.push("/payment");
                    } else {
                      setIsSelectModelDialogOpen(false);
                      setSelectedAIModel(aiModel);
                      window.history.pushState(null, "", aiModel.route);
                    }
                  }}
                >
                  {aiModel?.premium ? (
                    <div className="h-[35px] w-[35px] flex items-center justify-center mr-1">
                      <img
                        src={"/goldenBrain.png"}
                        alt="Golden Brain"
                        className="h-6"
                        style={{ borderRadius: "50%" }}
                      />
                    </div>
                  ) : (
                    <div className="h-[35px] w-[35px] flex items-center justify-center mr-1"></div>
                  )}
                  <div class="w-[35px] h-[35px] overflow-hidden rounded-full">
                    <img
                      src={aiModel.image}
                      alt="Sample Image"
                      class="object-cover w-full h-full"
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
