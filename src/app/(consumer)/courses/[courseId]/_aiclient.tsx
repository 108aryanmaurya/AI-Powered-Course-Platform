import MarkdownRenderer from "@/components/MarkDownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/services/socket";
import { ArrowUp, Loader, Loader2, Mic, MicOff } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Check for Web Speech API support
const SpeechRecognition =
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition);

export function AIAssistant({ userId }: { userId: string }) {
  const { courseId } = useParams();
  const [input, setInput] = useState("");
  const [streamed, setStreamed] = useState("");
  const [history, setHistory] = useState<
    { role: "user" | "ai"; content: string; status?: boolean }[]
  >([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const sentRef = useRef(false);
  const [queryStatus, setQueryStatus] = useState("");
  const streamedRef = useRef("");

  useEffect(() => {
    streamedRef.current = streamed;
  }, [streamed]);
  // Scroll to bottom on message update
  useEffect(() => {
    if (chatBottomRef.current)
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history, streamed]);
  useEffect(() => {
    socket.emit("join", { user_id: userId });
  }, [userId]);
  useEffect(() => {
    socket.on("stream", (data) => {
      setStreamed((prev) => prev + data.chunk);
    });

    socket.on("query_status", (data) => {
      console.log(data);
      if (data.step == "Done" && streamedRef.current) {
        setHistory((prev) => [
          ...prev,
          { role: "ai", content: streamedRef.current, status: true },
        ]);
        setStreamed("");
        streamedRef.current = "";
        setQueryStatus("");
      } else if (data?.step?.includes("Error")) {
        setHistory((prev) => [
          ...prev,
          { role: "ai", content: data.step, status: false },
        ]);
        setStreamed("");
        setQueryStatus("");
      } else {
        console.log(data.step);
        setQueryStatus(() => data.step);
      }
    });

    socket.on("ack", (data) => {
      // (Optional) Acknowledge
    });

    return () => {
      socket.off("stream");
      socket.off("ack");
    };
  }, []);

  const handleSend = (customInput?: string) => {
    const message = customInput !== undefined ? customInput : input;
    if (!message.trim()) return;
    setHistory((prev) => [...prev, { role: "user", content: message }]);
    setStreamed("");
    socket.emit("user_query", {
      user_id: userId,
      course_id: courseId,
      message,
    });
    setInput("");
    setTranscript("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // Speech recognition handlers
  const startRecognition = () => {
    if (!SpeechRecognition)
      return alert("Speech recognition is not supported in this browser.");
    setIsMicOn(true);
    sentRef.current = false;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        } else {
          interim += transcriptPart;
        }
      }
      const currentTranscript = (finalTranscript + interim).trim();
      if (/okay reply/i.test(currentTranscript) && !sentRef.current) {
        sentRef.current = true;
        const cleaned = currentTranscript.replace(/okay reply/i, "").trim();
        stopRecognition();
        handleSend(cleaned);
        return;
      }
      setTranscript(currentTranscript);

      // If user says "OK REPLY" (case-insensitive), send and stop listening
    };

    recognition.onerror = (e: any) => {
      setIsMicOn(false);
    };
    recognition.onend = () => {
      setIsMicOn(false);
    };
    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsMicOn(false);
    }
  };

  const handleMicClick = () => {
    if (isMicOn) {
      stopRecognition();
    } else {
      setTranscript("");
      startRecognition();
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border border-gray-200">
      <div className="flex-1 overflow-y-auto px-4 gap-2">
        {history.length === 0 && !streamed && (
          <div className="flex flex-col   rounded-2xl items-center justify-center h-full py-12">
            <div className="text-4xl mb-6">🤖</div>
            <p className="text-3xl text-purple-500 font-bold my-2 text-center ">
              Welcome to AI Assistant!
            </p>
            <p className="text-gray-600 text-lg text-center max-w-xl mb-3">
              This assistant is designed to help you master every topic in your
              course. <br />
            </p>
            <span className="inline-block mt-2 text-center">
              Ask questions about any concept, lesson, or code snippet.
              <br />
              Get instant explanations, code examples, and references
              <br />
              All powered by AI!
            </span>
            <ol className="text-gray-500 text-md mt-3 space-y-1 list-disc pl-5">
              <li>
                - Type your question or use the{" "}
                <span className="font-semibold">mic</span> to ask by voice.
              </li>
              <li>- See answers with Markdown, code, and helpful links.</li>
              <li>- Ask follow-up questions anytime.</li>
            </ol>
          </div>
        )}

        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex my-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] px-4 py-2 rounded-2xl text-base ${
                msg.role === "user"
                  ? "bg-purple-500 text-white rounded-br-none"
                  : !msg?.status
                  ? "bg-red-100 text-red-500 border-red-500 border-[1px] font-medium"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              <MarkdownRenderer
                md={
                  msg.content

                  //                   `Hi Aryan,

                  // # JavaScript  💡
                  // - JavaScript is one of the most popular and widely used programming languages in the world right now.
                  // 2. It's growing faster than any other programming languages📈, and big companies like Netflix, Walmart, and PayPal build entire applications around JavaScript.
                  // 3. JavaScript was originally designed to run only in browsers. So every browser has what we call a JavaScript engine that can execute JavaScript code. For example, the JavaScript engines in Firefox and Chrome are SpiderMonkey and V8.

                  // # ECMAScript 📖
                  // 1. ECMAScript is just a specification. JavaScript is a programming language that confirms to this specification.
                  // 2. We have this organization called ECMA, which is responsible for defining standards.
                  // 3. They take care of this ECMAScript specification. The first version of ECMAScript was released back in 1997. Starting from 2015, ECMA has been working on annual releases of a new specification.

                  // # Average Salary of a JavaScript Developer 🤑
                  // 1. The average salary of a JavaScript developer in the United States is around $72,000 per year. Hence, it's a great opportunity to land a good job by mastering JavaScript.

                  // To get a detailed understanding of JavaScript, You can refer to the course:
                  // Course > 'Javascript Mastery' > 'Introduction to Javascript' > [157.05999755859375-211.5800018310547](https://ik.imagekit.io/108aryan/lesson-video-1747908951131_QgtljwdRhW) for ECMAScript and JavaScript.
                  // Course > 'Javascript Mastery' > 'Introduction to Javascript' > [0.0-44.560001373291016](https://ik.imagekit.io/108aryan/lesson-video-1747908951131_QgtljwdRhW) for Average Salary of JavaScript Developer in U.S. .
                  // `
                }
              />
            </div>
          </div>
        ))}
        {/* Streaming AI response bubble */}

        {streamed ||
          (queryStatus && (
            <div className="flex justify-start">
              <div className="max-w-[90%] px-4 py-2 rounded-2xl text-base bg-gray-100 text-gray-900 rounded-bl-none border border-purple-200">
                <p className="animate-pulse font-medium text-sm flex items-center gap-1">
                  <Loader className="animate-spin"></Loader>{" "}
                  <span>{queryStatus}</span>
                  ...
                </p>
                <MarkdownRenderer md={streamed}></MarkdownRenderer>
                <span className="animate-pulse text-gray-500">▍</span>
              </div>
            </div>
          ))}

        {/* Live Speech Transcript */}
        {isMicOn && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-2 mt-2 rounded-2xl text-base bg-blue-50 text-blue-900 border border-blue-300 animate-pulse">
              <span className="font-semibold mr-2">🎤 Listening...</span>
              {transcript}
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>
      <div className="flex p-3 border-t border-gray-200 bg-gray-50 items-center gap-2">
        <Input
          className="flex-1 rounded-full h-14"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type your message..."
          disabled={isMicOn}
        />
        <Button
          onClick={handleMicClick}
          className={`rounded-full flex items-center justify-center ${
            isMicOn ? "bg-red-500" : "bg-blue-500"
          }`}
          size="icon"
          type="button"
          aria-label={isMicOn ? "Stop mic" : "Start mic"}
        >
          {isMicOn ? <MicOff className="animate-pulse" /> : <Mic />}
        </Button>
        <Button
          // onClick={() => handleSend()}
          onClick={async () => handleSend()}
          className="rounded-full bg-purple-500"
          size="icon"
          type="button"
        >
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}
