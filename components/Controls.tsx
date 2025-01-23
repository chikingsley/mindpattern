"use client";
import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toggle } from "./ui/toggle";
import MicFFT from "./MicFFT";
import { cn } from "../lib/utils";
import { useChatContext } from "../app/context/ChatContext";
import { Card, CardContent } from "./ui/card";

export default function Controls() {
  const { disconnect, status, isMuted, unmute, mute, micFft } = useVoice();
  const { selectSession } = useChatContext();

  const handleEndCall = () => {
    disconnect();
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 left-64 p-4 flex items-center justify-center",
        "bg-gradient-to-t from-background via-background/90 to-transparent",
      )}
    >
      <AnimatePresence mode="wait">
        {status.value === "connected" ? (
          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Toggle
                  pressed={!isMuted}
                  onPressedChange={() => {
                    if (isMuted) {
                      unmute();
                    } else {
                      mute();
                    }
                  }}
                >
                  {isMuted ? (
                    <MicOff className={"size-4"} />
                  ) : (
                    <Mic className={"size-4"} />
                  )}
                </Toggle>

                <div className={"relative grid h-8 w-48 shrink grow-0"}>
                  <MicFFT fft={micFft} className={"fill-current"} />
                </div>

                <Button
                  className={"flex items-center gap-1"}
                  onClick={handleEndCall}
                  variant={"destructive"}
                >
                  <span>
                    <Phone
                      className={"size-4 opacity-50"}
                      strokeWidth={2}
                      stroke={"currentColor"}
                    />
                  </span>
                  <span>End Call</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
