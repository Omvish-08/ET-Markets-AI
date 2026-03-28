import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_INSTRUCTION = `You are ET Markets Next-Gen AI, an expert financial advisor and market analyst for the Indian Stock Market (NSE/BSE). 
Your goal is to provide deep, actionable, and data-driven insights to retail investors.
- Always cite sources or explain the rationale behind your analysis.
- Consider technicals, fundamentals, and macro-economic factors.
- Use formatting (bolding, bullet points) to make your answers easy to read.
- CRITICAL: By analysis of each and every factor, you MUST give explicit decisions of BUY, SELL, or HOLD for any stock queried. Do not be vague.
- Assume the user is an Indian retail investor looking for actionable intelligence.`;

export function MarketChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your ET Markets AI Intelligence assistant. Ask me to analyze a stock, explain a technical pattern, or summarize recent corporate filings."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

      // Filter out the initial greeting to ensure the conversation starts with a user message
      const historyMessages = messages.filter(msg => msg.id !== "1");
      
      const contents = historyMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })).concat([{ role: 'user', parts: [{ text: userMessage }] }]);

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      let fullResponse = "";
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response. Please try again.");
      setMessages(prev => {
        // Remove the empty assistant message if it failed immediately
        const filtered = prev.filter(msg => msg.id !== (Date.now() + 1).toString() && msg.content !== "");
        return [...filtered, { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: "I encountered an error while analyzing the market data. Please try again." 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-md border border-indigo-500/20 shadow-inner">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-medium text-zinc-100">Market ChatGPT <span className="text-xs text-indigo-400 ml-2 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full shadow-sm shadow-indigo-500/10">Next Gen</span></h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-indigo-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-sm text-zinc-400">Analyzing market data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 relative z-10">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a stock, sector, or market trend..."
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-full pl-5 pr-12 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {["Analyze HDFC Bank Q3 results", "What is a Cup & Handle pattern?", "Top FII buys this week"].map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(suggestion)}
              className="whitespace-nowrap px-3 py-1.5 bg-zinc-800/30 hover:bg-zinc-800/80 border border-zinc-700/30 hover:border-zinc-700/80 rounded-full text-xs text-zinc-400 hover:text-zinc-300 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
