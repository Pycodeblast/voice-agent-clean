import { useState, useRef } from "react";
import axios from "axios";
import { Mic, Bot, User, Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  // TEXT TO SPEECH
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  };

  // GEMINI API
const getAIResponse = async (message) => {
  try {
    setLoading(true);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization:`Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",

          messages: [
            {
              role: "system",
              content: `
You are an enterprise IT support AI assistant.

Rules:
- Be professional
- Give short troubleshooting answers
- Help with VPN, WiFi, password reset, Outlook, laptop issues
              `,
            },

            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    const aiText =
      data.choices?.[0]?.message?.content ||
      "No response generated.";

    return aiText;
  } catch (error) {
    console.log(error);

    return "AI service temporarily unavailable.";
  } finally {
    setLoading(false);
  }
};

  // SPEECH RECOGNITION
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;

      const userMessage = {
        role: "user",
        text: transcript,
      };

      setMessages((prev) => [...prev, userMessage]);

      const aiReply = await getAIResponse(transcript);

      const aiMessage = {
        role: "ai",
        text: aiReply,
      };

      setMessages((prev) => [...prev, aiMessage]);

      speak(aiReply);

      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  };

return (
  <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative overflow-hidden">

    {/* BACKGROUND GLOW */}
    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full"></div>

    {/* MOBILE TOP BAR */}
    <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl z-20">
      <h1 className="text-xl font-bold text-cyan-400">VoiceDesk AI</h1>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
    </div>

    {/* SIDEBAR (DESKTOP ONLY) */}
    <div className="hidden md:block w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-10">

      <h1 className="text-4xl font-bold mb-10 text-cyan-400">
        VoiceDesk AI
      </h1>

      <div className="space-y-4 text-zinc-300">

        <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/20">
          Dashboard
        </div>

        <div className="p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
          Tickets
        </div>

        <div className="p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
          Analytics
        </div>

        <div className="p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
          Settings
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-5">

        <p className="text-sm text-zinc-400">
          AI Support Status
        </p>

        <div className="flex items-center gap-3 mt-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-400">Online & Active</span>
        </div>
      </div>

      {/* METRICS */}
      <div className="mt-8 space-y-4">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-zinc-400 text-sm">Resolved Today</p>
          <h2 className="text-3xl font-bold mt-2">42</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-zinc-400 text-sm">Active Tickets</p>
          <h2 className="text-3xl font-bold mt-2">8</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-zinc-400 text-sm">AI Accuracy</p>
          <h2 className="text-3xl font-bold mt-2">96%</h2>
        </div>
      </div>
    </div>

    {/* MAIN */}
    <div className="flex-1 flex flex-col z-10 w-full">

      {/* HEADER */}
      <div className="border-b border-white/10 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:justify-between md:items-center backdrop-blur-xl bg-white/5">

        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            AI Enterprise Support Agent
          </h2>

          <p className="text-cyan-400 mt-1 md:mt-2 text-sm md:text-base">
            Voice-enabled real-time IT assistance
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 md:px-5 md:py-3 rounded-2xl">

          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

          <span className="text-green-400 text-sm md:text-base">
            AI Active
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="p-4 md:p-5 flex gap-3 flex-wrap md:flex-nowrap overflow-x-auto border-b border-white/10">

        {[
          "VPN issue",
          "Password reset",
          "WiFi problem",
          "Outlook issue",
          "Laptop slow",
        ].map((item, index) => (
          <button
            key={index}
            className="bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 transition-all px-4 py-2 md:px-5 md:py-3 rounded-2xl text-sm whitespace-nowrap"
          >
            {item}
          </button>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-5 md:space-y-6">

        {messages.length === 0 && (
          <div className="text-center mt-24 md:mt-40">

            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ask your IT issue
            </h2>

            <p className="text-zinc-400 mt-4 md:mt-5 text-base md:text-lg">
              VPN, WiFi, Outlook, Password Reset...
            </p>

            <p className="text-cyan-400 mt-3 text-sm md:text-base">
              Powered by AI • VoiceDesk Enterprise Suite
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-2xl p-4 md:p-5 rounded-3xl border ${
                msg.role === "user"
                  ? "bg-cyan-500 text-white border-cyan-400"
                  : "bg-white/5 backdrop-blur-xl border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">

                {msg.role === "user" ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}

                <span className="font-semibold text-sm md:text-base">
                  {msg.role === "user" ? "User" : "AI Support"}
                </span>
              </div>

              <p className="text-sm leading-7 whitespace-pre-wrap">
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-cyan-400">

            <Loader className="animate-spin" />

            <span className="text-sm md:text-base">
              AI analyzing issue...
            </span>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 p-4 md:p-8 flex flex-col items-center gap-4 backdrop-blur-xl bg-white/5">

        {listening && (
          <p className="text-cyan-400 animate-pulse text-base md:text-lg">
            🎤 Listening...
          </p>
        )}

        <button
          onClick={startListening}
          disabled={loading}
          className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_60px_rgba(0,255,255,0.5)] relative ${
            listening
              ? "bg-red-500 scale-110 animate-pulse"
              : "bg-cyan-500 hover:scale-105"
          }`}
        >
          <Mic size={42} />
        </button>

        <p className="text-zinc-500 text-xs md:text-sm text-center">
          Powered by AI • Enterprise Voice Automation
        </p>
      </div>
    </div>
  </div>
);
}