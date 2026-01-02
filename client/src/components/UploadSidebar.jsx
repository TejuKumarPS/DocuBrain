import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Database,
  Bot,
} from "lucide-react";

const UploadSidebar = ({ sessionId, onUploadSuccess, activeDoc }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("sessionId", sessionId);

      await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
      setSuccess(true);

      if (onUploadSuccess) {
        onUploadSuccess(file);
      }

      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Bot size={28} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">
            DocuBrain
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-600">
            Upload Document
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`
              border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center
              ${
                file
                  ? "border-indigo-400 bg-indigo-50/50"
                  : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
              }
            `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-indigo-500">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {file ? file.name : "Click to browse PDF"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`
            w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all
            ${
              uploading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5"
            }
          `}
          >
            {uploading ? "Processing..." : "Analyze PDF"}
          </button>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <CheckCircle size={14} />
            <span>Ready to chat!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {activeDoc && !file && (
          <div className="mt-2 animate-fade-in-up">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm text-rose-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {activeDoc.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(activeDoc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1.5 rounded-md w-fit">
                <Database size={12} />
                <span>LIVE & INDEXED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400 leading-relaxed text-center">
          Supported: PDF only <br />
          Max size: 10MB
        </p>
      </div>
    </div>
  );
};

export default UploadSidebar;
