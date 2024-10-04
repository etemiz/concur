"use client";
import Image from "next/image";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";

export default function AddReactionDialog({
  isAddReactionDialogOpen,
  setIsAddReactionDialogOpen,
  handleReactionOnMessage,
}) {
  return (
    <>
      <Dialog
        open={isAddReactionDialogOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => setIsAddReactionDialogOpen(false)}
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
              <div className="flex justify-between">
                <Image
                  src="/like.png"
                  width={50}
                  height={50}
                  alt="Like"
                  className="mx-auto hover:scale-110"
                  onClick={() => {
                    setIsAddReactionDialogOpen(false);
                    handleReactionOnMessage("👍");
                  }}
                />
                <Image
                  src="/dislike.png"
                  width={50}
                  height={50}
                  alt="Dislike"
                  className="mx-auto hover:scale-110"
                  onClick={() => {
                    setIsAddReactionDialogOpen(false);
                    handleReactionOnMessage("👎");
                  }}
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
