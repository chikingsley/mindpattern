"use client";

import Messages from "./Messages";
import Controls from "./Controls";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat-input";
import { MagnetizeButton } from "@/components/ui/magnetize-button";
import { ArrowRight, Mic, Paperclip } from "lucide-react";
import { cn } from "../utils";
import React from "react";
import { useChatContext } from "../app/context/ChatContext";

export default function Chat() {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedSession } = useChatContext();

  // If no session is selected, show empty state
  if (!selectedSession) {
    const [isListening, setIsListening] = React.useState(false);
    const [transcript, setTranscript] = React.useState("");
    const [inputValue, setInputValue] = React.useState("");

    const handleMicClick = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsListening(true);
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setTranscript(transcript);
        };
        
        recognition.start();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-4">
        <div className="flex w-full max-w-2xl items-center gap-2">
          <ChatInput
            value={transcript || inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message or use your microphone..."
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              className={cn(
                "hover:bg-muted",
                isListening && "text-red-500 animate-pulse"
              )}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="hover:bg-muted text-muted-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <MagnetizeButton>
              Start Call
              <ArrowRight className="h-5 w-5" />
            </MagnetizeButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Messages ref={ref} />
      <Controls />
    </div>
  );
}
