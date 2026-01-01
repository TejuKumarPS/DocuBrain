import React, { useRef, useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  X,
  Loader2,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const UploadSidebar = ({
  onUploadSuccess,
  activeDoc,
  sessionId,
  startNewChat,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("sessionId", sessionId);

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      await axios.post(`${apiUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("File uploaded successfully");
      setUploadStatus("success");
      if (startNewChat) {
        startNewChat();
      }
      onUploadSuccess(file.name);
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
            DocuBrain
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
            AI DOCUMENT ASSISTANT
          </p>
        </div>
      </div>

      <div className="p-6">
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current.click()}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`
            relative group cursor-pointer h-40 rounded-2xl border-2 border-dashed transition-all duration-300
            flex flex-col items-center justify-center gap-3 text-center overflow-hidden
            ${
              isHovering
                ? "border-indigo-400 bg-indigo-50/50"
                : "border-slate-200 bg-slate-50/50"
            }
            ${
              uploadStatus === "uploading"
                ? "pointer-events-none opacity-80"
                : ""
            }
          `}
        >
          <AnimatePresence mode="wait">
            {uploadStatus === "uploading" ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                <span className="text-xs font-semibold text-indigo-600">
                  Processing Vector Embeddings...
                </span>
              </motion.div>
            ) : uploadStatus === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <div className="bg-green-100 p-2 rounded-full mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-sm font-bold text-green-700">
                  Ready to Chat!
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center p-4"
              >
                <div
                  className={`p-3 rounded-xl mb-2 transition-colors ${
                    isHovering ? "bg-white shadow-md" : "bg-white/50"
                  }`}
                >
                  <UploadCloud
                    className={`w-6 h-6 ${
                      isHovering ? "text-indigo-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload PDF
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Maximum size: 10MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Active Knowledge Base
        </h3>
        {activeDoc ? (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-3 bg-white border border-indigo-100 rounded-xl shadow-sm flex items-center gap-3 group hover:border-indigo-300 transition-colors"
          >
            <div className="bg-indigo-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {activeDoc}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Live & Indexed
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 italic">
              No document selected
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] text-center text-slate-400">
          Powered by{" "}
          <span className="font-bold text-indigo-500">Groq Llama-3</span> &{" "}
          <span className="font-bold text-indigo-500">LangChain</span>
        </p>
      </div>
    </div>
  );
};

export default UploadSidebar;
