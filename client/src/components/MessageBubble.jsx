import React from "react";
import { Bot, User, Sparkles, FileText } from "lucide-react";
import { motion } from "framer-motion";

const MessageBubble = ({ message }) => {
  const isAi = message.role === "ai";

  const uniqueSources = message.sources
    ? Array.from(
        new Map(
          message.sources.map((item) => [item.loc?.pageNumber, item])
        ).values()
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-4 mb-6 ${isAi ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className={`
        w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
        ${
          isAi
            ? "bg-white text-indigo-600 border border-indigo-100 ring-2 ring-indigo-50"
            : "bg-indigo-600 text-white shadow-indigo-200"
        }
      `}
      >
        {isAi ? (
          <Bot size={20} strokeWidth={2.5} />
        ) : (
          <User size={20} strokeWidth={2.5} />
        )}
      </div>

      <div
        className={`
        relative max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-sm text-sm leading-7 tracking-wide
        ${
          isAi
            ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-indigo-200"
        }
      `}
      >
        <p className="whitespace-pre-wrap font-medium">{message.content}</p>

        {/* Citations Section (Only for AI) */}
        {isAi && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100/80">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sources Found
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSources.map((source, idx) => (
                <div
                  key={idx}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5 
                    bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 
                    rounded-lg text-xs font-semibold text-slate-500 hover:text-indigo-600 
                    transition-colors cursor-default
                  "
                >
                  <FileText size={12} />
                  <span>Page {source.loc?.pageNumber || "?"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
