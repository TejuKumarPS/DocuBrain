import React, { useState, useRef, useEffect } from "react";
import { Loader2, ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import UploadSidebar from "./components/UploadSidebar";
import MessageBubble from "./components/MessageBubble";

function App() {
  const [activeDoc, setActiveDoc] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I am DocuBrain. Upload a PDF document to the left, and I can answer any questions based on its content.",
    },
  ]);
  const [sessionId, setSessionId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const newSessionId = Math.random().toString(36).substring(7);
    setSessionId(newSessionId);
    console.log("Session ID:", newSessionId);
  }, []);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startNewChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const parseStreamChunk = (chunk) => {
    const lines = chunk.split("\n\n");
    return lines
      .filter((line) => line.startsWith("data: "))
      .map((line) => line.replace("data: ", "").trim())
      .filter((line) => line !== "" && line !== "[DONE]")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "ai", content: "", sources: [] }]);

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          history: messages
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
          sessionId: sessionId,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        const packets = parseStreamChunk(chunkValue);

        for (const packet of packets) {
          if (!packet) continue;
          if (packet.type === "sources") {
            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastMsgIndex = newMsgs.length - 1;
              newMsgs[lastMsgIndex] = {
                ...newMsgs[lastMsgIndex],
                sources: packet.sources,
              };
              return newMsgs;
            });
          }
          if (packet.type === "content") {
            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastMsgIndex = newMsgs.length - 1;
              newMsgs[lastMsgIndex] = {
                ...newMsgs[lastMsgIndex],
                content: newMsgs[lastMsgIndex].content + packet.content,
              };
              return newMsgs;
            });
          }
        }
      }
    } catch (error) {
      console.error("Chat failed", error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = "Sorry, connection lost.";
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:bg-slate-200 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ml-3 font-bold text-lg text-indigo-600">
          DocuBrain
        </span>
      </div>

      <div
        className={`
          bg-white z-40 flex-shrink-0 border-r border-slate-200
          fixed inset-y-0 left-0 w-80 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-none md:block
        `}
      >
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <UploadSidebar
          onUploadSuccess={setActiveDoc}
          activeDoc={activeDoc}
          sessionId={sessionId}
          startNewChat={startNewChat}
        />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-full relative min-w-0 pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit shadow-sm"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    Analyzing document...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSend}
              className={`
                relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300
                ${
                  activeDoc
                    ? "bg-white border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50"
                    : "bg-slate-100 border-transparent opacity-60 cursor-not-allowed"
                }
              `}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeDoc ? "Ask something..." : "Upload a PDF first..."
                }
                disabled={!activeDoc || isLoading}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400 px-4 py-3 text-base"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !activeDoc}
                className={`
                  p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                  ${
                    input.trim() && !isLoading
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
