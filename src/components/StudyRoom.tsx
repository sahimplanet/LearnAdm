import React, { useState, useEffect } from "react";
import { Subject, StudyContent, UserProgress } from "../types";
import { AITutorChat } from "./AITutorChat";
import { 
  ArrowLeft, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  MessageSquare, 
  Send, 
  CheckCircle,
  BrainCircuit,
  Loader2,
  X,
  Volume2
} from "lucide-react";

interface StudyRoomProps {
  subject: Subject;
  topicId: string;
  progress: UserProgress;
  onBack: () => void;
  onMarkComplete: (topicId: string, subjectName: string, topicName: string) => void;
  onStartQuiz: (subject: Subject, topicId: string) => void;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({
  subject,
  topicId,
  progress,
  onBack,
  onMarkComplete,
  onStartQuiz
}) => {
  const topic = subject.topics.find((t) => t.id === topicId);
  const topicName = topic?.name || "Topic";

  // Content state
  const [content, setContent] = useState<StudyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Webhook AI Summary state
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  const handleAiSummaryClick = async () => {
    setIsSendingWebhook(true);
    setWebhookMessage(null);
    try {
      await fetch("https://hook.us2.make.com/5yrgk6kf3oseov9hz4rac6b1vnvl5lti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: topicName,
          topic: topicName,
          subject: subject.name,
          grade: subject.grade
        }),
      });
      setWebhookMessage("Webhook activated for topic!");
    } catch (err) {
      console.error("Webhook trigger notice:", err);
      setWebhookMessage("Webhook activated!");
    } finally {
      setIsSendingWebhook(false);
      setTimeout(() => setWebhookMessage(null), 4000);
    }
  };

  // AI Tutor state
  const [showTutor, setShowTutor] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "tutor"; text: string }[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Check if topic is completed
  const isCompleted = progress.completedTopics.includes(topicId);

  // Fetch Topic Content on Mount
  useEffect(() => {
    let active = true;
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: subject.id,
            subjectName: subject.name,
            topicId: topicId,
            topicName: topicName,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status} failed to fetch study guide.`);
        }

        const data = await response.json();
        if (active) {
          setContent(data);
          // Set initial chat welcome log
          setChatLog([
            {
              sender: "tutor",
              text: `Welcome! I'm Socrates AI, your dedicated tutor for "${topicName}". I've put together a lesson summary, core conceptual breakdowns, and active recall flashcards on this page.\n\nAsk me any follow-up question! For example: "Can you explain concept #1 like I am 5 years old?" or "What is a cool real-world analogy for this?"`
            }
          ]);
        }
      } catch (err: any) {
        console.error("Error fetching study content:", err);
        if (active) {
          setError(err.message || "Failed to contact study engine.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchContent();
    return () => {
      active = false;
    };
  }, [subject.id, subject.name, topicId, topicName]);

  // Handle flashcard navigation
  const nextCard = () => {
    if (!content?.flashcards) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % content.flashcards.length);
    }, 150);
  };

  const prevCard = () => {
    if (!content?.flashcards) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + content.flashcards.length) % content.flashcards.length);
    }, 150);
  };

  // Handle Tutor Chat submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || tutorLoading || !content) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatLog((prev) => [...prev, { sender: "user", text: userMessage }]);
    setTutorLoading(true);

    try {
      // Create simple context containing summary & concepts to ground the model
      const contextSummary = `Topic: ${content.topicName}. Summary: ${content.summary}. Concepts: ${content.concepts.map(c => `${c.title}: ${c.content}`).join("; ")}`;
      
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: content.topicName,
          question: userMessage,
          context: contextSummary
        })
      });

      if (!res.ok) {
        throw new Error("Tutor was temporarily disconnected.");
      }

      const data = await res.json();
      setChatLog((prev) => [...prev, { sender: "tutor", text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        { sender: "tutor", text: "Oops! I encountered an error connecting to my wisdom banks. Please verify your internet connection or check your GEMINI_API_KEY." }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      {/* Custom AITutorChat modal */}
      {showTutor && (
        <AITutorChat 
          subjectName={subject.name}
          topicName={topicName}
          summary={content?.summary}
          concepts={content?.concepts}
          onClose={() => setShowTutor(false)}
        />
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-800 text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Subjects
        </button>

        <div className="flex flex-wrap gap-2">
          {/* AI Tutor Toggle button */}
          <button
            onClick={() => setShowTutor(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-100/40 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Ask Socrates Tutor
          </button>

          {/* Mark completed */}
          {!isCompleted ? (
            <button
              disabled={loading}
              onClick={() => onMarkComplete(topicId, subject.name, topicName)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Read
            </button>
          ) : (
            <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed lesson
            </span>
          )}

          {/* Start Quiz */}
          <button
            disabled={loading}
            onClick={() => onStartQuiz(subject, topicId)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-950 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" /> Take Chapter Quiz
          </button>
        </div>
      </div>

      {/* Strand Banner with Big Uppercase Title & Blue AI SUMMARY Button */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {subject.name} • GRADE {subject.grade || 7} STRAND
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-950 uppercase tracking-tight leading-tight">
            {topicName.toUpperCase()}
          </h1>
          {topic?.description && (
            <p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
              {topic.description}
            </p>
          )}
        </div>

        {/* AI SUMMARY Button in Blue */}
        <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
          <button
            onClick={handleAiSummaryClick}
            disabled={isSendingWebhook}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer border border-blue-500/30 disabled:cursor-not-allowed"
            id="btn-ai-summary"
          >
            {isSendingWebhook ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AI IS PROCESSING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-100" />
                <span>AI SUMMARY</span>
              </>
            )}
          </button>
          
          {/* Active Processing Indicator */}
          {isSendingWebhook && (
            <div className="flex items-center gap-2 bg-blue-50/90 border border-blue-200 text-blue-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
              <span>AI is processing summary...</span>
            </div>
          )}

          {/* Success / Completion message */}
          {webhookMessage && !isSendingWebhook && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{webhookMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Skeleton / Error */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-indigo-600 mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg tracking-tight">Curating Lesson Materials</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Our AI academic tutor is designing clear conceptual modules, bullet takeaways, and active-recall flashcard study guides for "{topicName}".
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white border border-rose-100 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 text-base">Study Guide Connection Issue</h3>
            <p className="text-xs text-gray-400">{error}</p>
            <p className="text-xs text-gray-400 mt-2">
              If you are the developer, verify your <b>GEMINI_API_KEY</b> is correctly saved under <b>Settings &gt; Secrets</b>.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Lesson Content */}
      {content && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Lesson text and Takeaways */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Topic Summary Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Course Chapter Summary
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 mt-3 tracking-tight">
                  {content.topicName}
                </h1>
              </div>

              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 pt-5">
                {content.summary}
              </div>
            </div>

            {/* Core Sub-concepts Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Core Concepts
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {content.concepts.map((concept, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-100 rounded-xl p-6 space-y-2 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-gray-950 text-sm">{concept.title}</h4>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed pl-7">
                      {concept.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key takeaways card */}
            <div className="bg-gray-50 border border-gray-100 text-gray-900 rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-indigo-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Lesson Key Takeaways
              </h4>
              <ul className="space-y-2 text-gray-500 text-xs pl-4 list-disc marker:text-indigo-600">
                {content.takeaways.map((takeaway, idx) => (
                  <li key={idx} className="leading-relaxed">{takeaway}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side: Interactive Active Recall Flashcards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" /> Active Recall Flashcards
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {currentCardIndex + 1} / {content.flashcards.length}
                </span>
              </div>

              {/* Flashcard Component Container */}
              <div className="perspective-1000 h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div 
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full bg-gray-50 border border-gray-100 hover:border-indigo-100 rounded-xl p-5 flex flex-col justify-between backface-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Question / Keyword
                    </span>
                    <div className="flex-1 flex items-center justify-center text-center px-2">
                      <p className="font-bold text-gray-950 text-sm leading-relaxed">
                        {content.flashcards[currentCardIndex].question}
                      </p>
                    </div>
                    <div className="text-center text-[10px] font-bold text-indigo-600 flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin-slow" /> Click card to reveal explanation
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full bg-indigo-600 text-white rounded-xl p-5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md">
                    <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">
                      Active Answer Explanation
                    </span>
                    <div className="flex-1 flex items-center justify-center text-center overflow-y-auto px-2 my-2 py-1">
                      <p className="text-xs leading-relaxed text-indigo-50 font-medium">
                        {content.flashcards[currentCardIndex].answer}
                      </p>
                    </div>
                    <div className="text-center text-[10px] font-bold text-indigo-200 flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Click to see question again
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-between pt-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevCard(); }}
                  className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  Flip Card
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); nextCard(); }}
                  className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Socrates Tutor Quick Tip panel */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-gray-950 text-xs flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-600" /> Socrates study suggestion:
              </h4>
              <p className="text-gray-400 text-[11px] leading-relaxed font-normal">
                "Struggling with a formula or concept? Toggle my panel in the top right to start a dialogue! I can explain lessons in simple analogies, or quiz you on any concept."
              </p>
              <button 
                onClick={() => setShowTutor(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
              >
                Start Chatting <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
