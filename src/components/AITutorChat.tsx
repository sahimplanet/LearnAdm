import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  CornerDownLeft, 
  Play, 
  Square, 
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  BookOpen
} from "lucide-react";

interface AITutorChatProps {
  subjectName: string;
  topicName: string;
  summary?: string;
  concepts?: { title: string; content: string }[];
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Pre-defined CBE-focused response templates based on matched keywords
const generateCBEResponse = (
  question: string,
  topicName: string,
  subjectName: string,
  concepts: { title: string; content: string }[] = []
): string => {
  const qLower = question.toLowerCase();

  // Helper to get a random item
  const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const conceptListStr = concepts.length > 0 
    ? concepts.map(c => `• **${c.title}**: ${c.content}`).join("\n")
    : "The core principles of this topic.";

  // 1. ANALOGY
  if (qLower.includes("analogy") || qLower.includes("metaphor") || qLower.includes("like i am 5") || qLower.includes("eli5")) {
    const analogies = [
      `Let's break down **${topicName}** using a vibrant real-world analogy:

Think of it like learning to drive a car under a Competency-Based Education (CBE) model. In traditional schools, you sit in a classroom for 40 hours, take a written test, and get a grade. If you get a 'C', you still move to the next chapter, even though you didn't master parallel parking!

Under CBE, we don't care how many hours you sat in the seat. We care if you can safely navigate a busy roundabout, park perfectly, and handle highway merges. You practice each specific sub-skill at your own speed. Once you prove 100% mastery of all of them, you earn your license.

Applying this to **${topicName}**:
1. It isn't about memorizing vocabulary cards.
2. It is about possessing the practical competency to apply these lessons in live, complex settings.
3. Every sub-concept we study is a direct milestone on your mastery roadmap!

What part of this analogy resonates most with your current learning goals? Let's dive deeper!`,

      `Here is a powerful active-recall metaphor to make **${topicName}** stick instantly:

Imagine you are training to be a master chef. If you just read recipes from a textbook (traditional learning), you might know what ingredients go into a soufflé, but you'll burn it when cooking live. 

In our **CBE (Competency-Based Education)** framework, we treat **${topicName}** like a kitchen station certification:
* **The Recipe (Concept)**: Knowing the underlying facts.
* **The Chef's Knife (Skill)**: Learning how to split complex problems into bite-sized, actionable parts.
* **The Dinner Rush (Competency)**: Confidently executing the concept under pressure without looking at your notes.

Here are the key competency targets we are testing right now:
${conceptListStr}

Which of these chef-level competencies feels like your strongest skill right now, and which one would you like to practice cooking?`
    ];
    return sample(analogies);
  }

  // 2. CASE STUDY / PRACTICAL APPLICATION
  if (qLower.includes("case study") || qLower.includes("real world") || qLower.includes("apply") || qLower.includes("application") || qLower.includes("practical")) {
    return `Let's investigate a **Practical CBE Case Study** demonstrating **${topicName}** (${subjectName}) in action:

### 🌍 Scenario: The Operational Blueprint
Imagine a professional consulting team tasked with implementing solutions in a modern enterprise. In traditional environments, employees are judged by "time on task." However, under a **Competency-Based Framework**, performance is evaluated on concrete output standards.

### 🛠️ The Core Competencies at Play:
1. **Critical Analysis**: Deconstructing the initial system variables related to *${topicName}*.
2. **Applied Problem Solving**: Utilizing the theoretical knowledge to solve real-world friction points.
3. **Outcome Optimization**: Monitoring results against clear success rubrics.

### 📋 CBE Applied Action Steps:
* **Step 1: Diagnostic Assessment** — The professional identifies the exact scope of the challenge.
* **Step 2: Milestone Verification** — Each sub-skill is individually proven. For example, in our current topic, mastering:
${concepts.slice(0, 2).map(c => `  - *${c.title}*`).join("\n") || "  - Core concept mastery"}
* **Step 3: Feedback Loops** — Adapting strategies in real-time based on immediate competency rubrics.

This shift ensures that when you step into a career role, you don't just "know" the material—you can perform it at an expert standard. Would you like to design a mock business scenario where you have to apply this directly?`;
  }

  // 3. ASSESSMENT / QUIZ / TEST
  if (qLower.includes("test") || qLower.includes("assessment") || qLower.includes("quiz") || qLower.includes("exam") || qLower.includes("how is this assessed")) {
    return `In a **Competency-Based Education (CBE)** model, assessments look very different from standard rote-memorization standardized tests. Here is how your competency in **${topicName}** is measured:

### 🎯 1. Performance-Based Tasks
Instead of multiple-choice recall questions asking you to state dates or definitions, you will be given a complex, authentic scenario where you must:
* Formulate a solution using the concepts.
* Explain the *why* behind your analytical steps.

### 📊 2. Rubric-Level Metrics
Your progress is measured across three distinct levels of competency:
1. **Emerging (Recall)**: You understand the basic definitions and can match terms.
2. **Proficient (Application)**: You can use the knowledge to solve standard problems independently.
3. **Distinguished (Integration & Transfer)**: You can apply the lesson to entirely new, unfamiliar situations and evaluate potential outcomes.

### 💡 Suggested Study Drill:
Try to explain how **${concepts[0]?.title || "the first concept"}** directly influences **${concepts[1]?.title || "the secondary concept"}**. If you can link these two together, you have progressed from simple recall to a distinguished level of competency!

Would you like me to give you a scenario-based diagnostic question right now to test your application skill?`;
  }

  // 4. GENERAL / DEFAULT CBE RESPONSE
  return `Greetings! As your dedicated **CBE Academic Coach**, let's untangle **${topicName}** together. 

In a Competency-Based model, our primary goal is to ensure you don't just memorize information, but develop a **functional mastery** of the core skills in **${subjectName}**.

### 🔑 Core Competency Breakdown for This Lesson:
${conceptListStr}

### 💡 Dynamic Cognitive Drill:
To build active recall, let's look at the main concept: **"${concepts[0]?.title || "the core competency"}"**.
In practice, this means being able to:
1. Identify the concept in everyday life.
2. Analyze how different variables interact with it.
3. Apply it to make predictions or solve problems.

What specific question or real-world example about **${topicName}** can I clarify for you to help you lock in this competency?`;
};

export const AITutorChat: React.FC<AITutorChatProps> = ({
  subjectName,
  topicName,
  summary = "",
  concepts = [],
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(15); // ms per character interval
  const activeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set up welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "tutor",
        text: `Hello! I am your **CBE Syllabus Expert**. 

My goal is to help you master the practical competencies and real-world skills within **${topicName}** (${subjectName}). 

Use the quick-start prompt chips below, or ask any question to start our active learning dialogue!`,
        timestamp: new Date()
      }
    ]);
  }, [topicName, subjectName]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    };
  }, []);

  const stopStreaming = () => {
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
    setIsTyping(false);
    setMessages(prev => 
      prev.map(msg => msg.isStreaming ? { ...msg, isStreaming: false } : msg)
    );
  };

  const startStreamingResponse = (fullResponseText: string) => {
    stopStreaming();
    setIsTyping(true);

    const newMsgId = `tutor-${Date.now()}`;
    
    // Add an empty message that will be streamed into
    setMessages(prev => [
      ...prev,
      {
        id: newMsgId,
        sender: "tutor",
        text: "",
        timestamp: new Date(),
        isStreaming: true
      }
    ]);

    let currentIndex = 0;
    // We stream word-by-word or in small chunks for natural speed
    const words = fullResponseText.split(" ");
    
    const interval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(interval);
        activeIntervalRef.current = null;
        setIsTyping(false);
        setMessages(prev => 
          prev.map(msg => msg.id === newMsgId ? { ...msg, isStreaming: false, text: fullResponseText } : msg)
        );
        return;
      }

      // Append next words
      const nextChunk = words.slice(0, currentIndex + 1).join(" ");
      setMessages(prev => 
        prev.map(msg => msg.id === newMsgId ? { ...msg, text: nextChunk } : msg)
      );
      currentIndex += 2; // Stream 2 words at a time for a smooth fluid effect
    }, streamSpeed * 4); // Scaled multiplier for words

    activeIntervalRef.current = interval;
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI thinking delay before streaming starts
    setIsTyping(true);
    setTimeout(() => {
      const generatedAnswer = generateCBEResponse(textToSend, topicName, subjectName, concepts);
      startStreamingResponse(generatedAnswer);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const clearChat = () => {
    stopStreaming();
    setMessages([
      {
        id: "welcome-reset",
        sender: "tutor",
        text: `Chat history cleared. What specific competency in **${topicName}** should we break down next?`,
        timestamp: new Date()
      }
    ]);
  };

  const quickPrompts = [
    { label: "Analogy to explain this", q: "Can you give me an active recall analogy/metaphor to lock this topic in?" },
    { label: "CBE Practical Case Study", q: "Show me a real-world CBE case study for applying this topic in a career." },
    { label: "How is this assessed?", q: "How is this competency measured on a professional or mastery-based exam?" },
    { label: "Socrates Challenge Drill", q: "Give me an active recall diagnostic drill question about this concept." }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end md:p-4 animate-fade-in" id="ai-tutor-modal">
      <div className="w-full max-w-xl bg-white h-full md:h-[95vh] md:rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-2xl animate-slide-in mt-auto">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/95 flex items-center justify-center text-white font-extrabold text-sm shadow-md animate-pulse">
              CBE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight text-white">Socrates AI Tutor</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> CBE Specialist
                </span>
              </div>
              <p className="text-[10px] text-gray-300 truncate max-w-[280px] mt-0.5">
                Topic: <span className="font-semibold text-indigo-300">{topicName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Clear chat history"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              id="clear-chat-btn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              id="close-tutor-btn"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50/70 border-b border-indigo-100/40 px-4 py-2.5 flex items-center justify-between text-[11px] text-indigo-900 shrink-0">
          <span className="font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600 animate-bounce" /> Streaming Competency Answers
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Speed:</span>
            <select 
              value={streamSpeed} 
              onChange={(e) => setStreamSpeed(Number(e.target.value))}
              className="bg-white border border-indigo-200 rounded px-1.5 py-0.5 font-bold text-indigo-800 outline-none cursor-pointer"
              id="stream-speed-select"
            >
              <option value={30}>Standard</option>
              <option value={15}>Fast</option>
              <option value={5}>Instant</option>
            </select>
          </div>
        </div>

        {/* Chat Logs Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50" id="chat-logs-container">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div 
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className={`max-w-[88%] rounded-xl px-4 py-3.5 text-xs shadow-sm leading-relaxed ${
                  isUser 
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}>
                  {/* Message body */}
                  <div className="whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  
                  {/* Timestamp & metadata */}
                  <div className={`text-[9px] mt-2 flex items-center justify-between gap-4 ${
                    isUser ? "text-indigo-200" : "text-gray-400"
                  }`}>
                    <span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <span className="font-semibold uppercase tracking-wider text-[8px] text-indigo-500 flex items-center gap-0.5">
                        <Award className="w-3 h-3" /> Competency-Based Guide
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-between items-center bg-white border border-indigo-100 rounded-xl p-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span>Tutor is formulating a competency roadmap...</span>
              </div>
              <button 
                onClick={stopStreaming}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-rose-100"
                id="stop-streaming-btn"
              >
                <Square className="w-2.5 h-2.5 fill-rose-600" /> Stop Streaming
              </button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick chip queries */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1 pl-1">
            <BookOpen className="w-3 h-3 text-indigo-600" /> CBE Study Suggestions
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handleSendMessage(chip.q)}
                className="px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 rounded-lg text-[10px] font-semibold transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-3.5 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder={isTyping ? "Please wait for streaming to complete..." : "Ask Socrates about this topic or competency..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="w-full pl-3.5 pr-10 py-3 bg-white text-gray-900 placeholder-gray-400 focus:placeholder-gray-300 text-xs border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 outline-none rounded-xl font-medium shadow-xs"
              id="tutor-chat-input"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              Enter <CornerDownLeft className="w-2 h-2" />
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-100 disabled:text-gray-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
            id="tutor-chat-submit-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
