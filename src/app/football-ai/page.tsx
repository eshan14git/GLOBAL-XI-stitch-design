"use client";

import { useState, useRef, useEffect } from "react";
import { askFootballAi, AskResponse } from "@/services/footballAi";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  intent?: string;
  source?: string;
  timestamp: string;
}

export default function FootballAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Welcome back, Analyst. The International Match Knowledge base is fully synced. I have processed the latest data from the top leagues and continental qualifiers. What insights do you need today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Who won the 2022 World Cup Final?",
    "What was the score between Brazil and Germany in 2014?",
    "Who scored in the 2018 World Cup Final?",
    "When did Argentina play France?"
  ];

  // Auto-scroll chat area
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response: AskResponse = await askFootballAi(questionText);
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: response.answer,
        intent: response.intent,
        source: response.source,
        timestamp: response.timestamp
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        sender: "ai",
        text: "Error retrieving insights. Please check the network path or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "ai",
        text: "Welcome back, Analyst. The International Match Knowledge base is fully synced. I have processed the latest data from the top leagues and continental qualifiers. What insights do you need today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center py-6 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto h-[calc(100vh-120px)] min-h-[500px]">
      <div className="w-full max-w-4xl flex flex-col h-full luxury-card rounded-xl overflow-hidden relative shadow-2xl">
        {/* Header */}
        <header className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
          <div>
            <h1 className="font-display text-2xl text-on-surface font-bold">Football AI Assistant</h1>
            <p className="font-mono text-label-sm text-on-surface-variant mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Status: <span className="text-primary font-bold">International Match Knowledge Base Active</span>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="border border-outline-variant/60 px-3 py-1.5 rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider cursor-pointer bg-surface/40 hover:bg-surface-container-low"
            title="Clear Chat"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset</span>
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto chat-scroll p-6 space-y-6 bg-surface-lowest/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 border flex items-center justify-center ${
                  msg.sender === "ai"
                    ? "border-primary/30 bg-surface-container"
                    : "border-primary-container/40 bg-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${msg.sender === "ai" ? "text-primary" : "text-primary-container"}`}>
                  {msg.sender === "ai" ? "smart_toy" : "person"}
                </span>
              </div>

              {/* Message Bubble */}
              <div className={`flex-grow max-w-[80%] ${msg.sender === "user" ? "flex flex-col items-end" : ""}`}>
                {/* AI Metadata Tags */}
                {msg.sender === "ai" && (msg.intent || msg.source) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {msg.intent && (
                      <span className="px-2 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary font-mono text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">analytics</span>
                        Intent: {msg.intent}
                      </span>
                    )}
                    {msg.source && (
                      <span className="px-2 py-0.5 rounded border border-outline-variant text-on-surface-variant font-mono text-[10px] uppercase tracking-wider">
                        Source: {msg.source}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`p-4 rounded-2xl border text-on-surface font-body text-body-md shadow-sm whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-surface-container border-primary/45 rounded-tr-sm"
                      : "bg-surface-container-high border-outline-variant/30 rounded-tl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <span className="text-[10px] text-on-surface-variant/50 mt-1 block ml-2 font-mono uppercase">
                  {msg.sender === "ai" ? "Global XI AI" : "You"} • {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Loading State */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex-shrink-0 border border-primary/30 flex items-center justify-center bg-surface-container">
                <span className="material-symbols-outlined text-primary text-sm animate-spin">sync</span>
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 text-on-surface-variant font-body text-body-md flex items-center gap-2">
                  <span className="flex gap-1.5 items-center justify-center h-4">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                  </span>
                  Analyzing tactical parameters...
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Example Suggestions Panel */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest/50 flex flex-wrap gap-2 items-center justify-center">
          <span className="font-mono text-label-sm text-on-surface-variant mr-1">Suggestions:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs border border-outline-variant/50 rounded-full py-1 px-3 bg-surface hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-outline-variant/30 bg-surface-container/80 flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Football AI about tournament winners, match stats or head-to-head history..."
            className="flex-grow bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg py-3.5 px-4 focus:outline-none focus:border-primary font-body text-body-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-container text-on-primary hover:bg-primary font-bold uppercase rounded-lg px-6 py-3.5 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </main>
  );
}
