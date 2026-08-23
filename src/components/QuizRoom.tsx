import React, { useState, useEffect } from "react";
import { Subject, Quiz, QuizQuestion } from "../types";
import { 
  ArrowLeft, 
  HelpCircle, 
  Award, 
  Check, 
  X, 
  ChevronRight, 
  Loader2, 
  Trophy,
  RefreshCw,
  Sparkles,
  BookOpen
} from "lucide-react";

interface QuizRoomProps {
  subject: Subject;
  topicId: string;
  onBack: () => void;
  onSaveScore: (topicId: string, score: number, subjectName: string, topicName: string) => void;
}

export const QuizRoom: React.FC<QuizRoomProps> = ({
  subject,
  topicId,
  onBack,
  onSaveScore
}) => {
  const topic = subject.topics.find((t) => t.id === topicId);
  const topicName = topic?.name || "Topic";

  const storageKey = `quiz_progress_${subject.id}_${topicId}`;

  // State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  // Load from localStorage or Fetch Quiz on Mount
  useEffect(() => {
    let active = true;

    // Check localStorage for saved progress first
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.quiz &&
          Array.isArray(parsed.quiz.questions) &&
          parsed.quiz.questions.length > 0 &&
          !parsed.completed
        ) {
          if (active) {
            setQuiz(parsed.quiz);
            setCurrentIdx(parsed.currentIdx ?? 0);
            setSelectedIdx(parsed.selectedIdx ?? null);
            setAnswered(parsed.answered ?? false);
            setScore(parsed.score ?? 0);
            setCompleted(false);
            setLoading(false);
            setIsResumed(true);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Error restoring quiz progress from localStorage:", e);
    }

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: subject.id,
            subjectName: subject.name,
            topicId: topicId,
            topicName: topicName
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status} failed to load quiz.`);
        }

        const data = await response.json();
        if (active) {
          setQuiz(data);
          // Persist initial quiz state
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                quiz: data,
                currentIdx: 0,
                selectedIdx: null,
                answered: false,
                score: 0,
                completed: false,
                updatedAt: Date.now()
              })
            );
          } catch (err) {
            console.warn("Could not save initial quiz state:", err);
          }
        }
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        if (active) {
          setError(err.message || "Failed to fetch quiz content.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();
    return () => {
      active = false;
    };
  }, [subject.id, subject.name, topicId, topicName, storageKey]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (!quiz) return;
    try {
      if (completed) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            quiz,
            currentIdx,
            selectedIdx,
            answered,
            score,
            completed: false,
            updatedAt: Date.now()
          })
        );
      }
    } catch (err) {
      console.warn("Error updating quiz progress in localStorage:", err);
    }
  }, [quiz, currentIdx, selectedIdx, answered, score, completed, storageKey]);

  // Handle Option Click
  const handleOptionClick = (optionIdx: number) => {
    if (answered || !quiz) return;
    
    setSelectedIdx(optionIdx);
    setAnswered(true);
    
    const correctIdx = quiz.questions[currentIdx].correctOptionIndex;
    if (optionIdx === correctIdx) {
      setScore((prev) => prev + 1);
    }
  };

  // Handle next question
  const handleNext = () => {
    if (!quiz) return;
    
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }
  };

  // Handle saving score
  const handleSaveScore = () => {
    if (!quiz) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    const finalPercentage = Math.round((score / quiz.questions.length) * 100);
    onSaveScore(topicId, finalPercentage, subject.name, topicName);
  };

  // Restart Quiz
  const handleRestart = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
    setIsResumed(false);
  };

  // Start fresh quiz by fetching new questions
  const handleStartFresh = async () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    setQuiz(null);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
    setIsResumed(false);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          subjectName: subject.name,
          topicId: topicId,
          topicName: topicName
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status} failed to load quiz.`);
      }

      const data = await response.json();
      setQuiz(data);
    } catch (err: any) {
      console.error("Error fetching fresh quiz:", err);
      setError(err.message || "Failed to fetch quiz content.");
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = quiz?.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Quiz Header controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-800 text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" /> Exit Quiz
        </button>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Chapter assessment
        </span>
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-indigo-600 mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-950 text-lg tracking-tight">Assembling Practice Quiz</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Socrates AI is generating 5 balanced conceptual questions with diagnostic grading keys for "{topicName}".
            </p>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {error && (
        <div className="bg-white border border-rose-100 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-bold text-gray-950 text-base">Quiz Generation Notice</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Resumed Progress Banner */}
      {quiz && isResumed && !completed && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 px-4 text-xs text-amber-900 font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Resumed your saved quiz progress (Question {currentIdx + 1} of {quiz.questions.length})</span>
          </div>
          <button
            onClick={handleStartFresh}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Start Fresh Quiz
          </button>
        </div>
      )}

      {/* Active Question screen */}
      {quiz && activeQuestion && !completed && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6">
          {/* Question Track header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="text-indigo-600">Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span>Score: {score}</span>
            </div>
            {/* Linear Progress bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-950 leading-snug tracking-tight">
              {activeQuestion.question}
            </h2>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {activeQuestion.options.map((option, idx) => {
              const isCorrect = idx === activeQuestion.correctOptionIndex;
              const isSelected = idx === selectedIdx;
              
              let btnClass = "bg-gray-50/60 hover:bg-gray-100/50 border-gray-100 text-gray-700";
              if (answered) {
                if (isCorrect) {
                  btnClass = "bg-emerald-50 border-emerald-100 text-emerald-800 font-semibold";
                } else if (isSelected) {
                  btnClass = "bg-rose-50 border-rose-100 text-rose-800 font-semibold";
                } else {
                  btnClass = "bg-gray-50/30 opacity-50 border-gray-100 text-gray-400";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-lg border text-xs md:text-sm transition-all flex items-center justify-between group ${btnClass} ${
                    !answered ? "cursor-pointer active:scale-[0.99] hover:border-gray-300" : ""
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {answered && isCorrect && (
                    <span className="p-1 rounded-full bg-emerald-500 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <span className="p-1 rounded-full bg-rose-500 text-white">
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation Panel */}
          {answered && (
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-lg space-y-2 animate-fade-in text-xs leading-relaxed">
              <h4 className="font-bold text-gray-950 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Explanation
              </h4>
              <p className="text-gray-500">
                {activeQuestion.explanation}
              </p>
              
              <div className="flex justify-end pt-3">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {currentIdx + 1 === quiz.questions.length ? "Finish Quiz" : "Next Question"} 
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion screen */}
      {completed && quiz && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-12 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-wider">
              Quiz Completed
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight mt-2">
              Aced "{topicName}" Assessment!
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
              You scored exactly <strong className="text-gray-700">{score} out of {quiz.questions.length}</strong> questions correct.
            </p>
          </div>

          {/* Visual Percentage score Ring */}
          <div className="py-2">
            <div className="inline-flex flex-col items-center justify-center p-5 bg-gray-50 rounded-lg border border-gray-100 min-w-40 relative">
              <span className="text-3xl font-extrabold text-gray-950">
                {Math.round((score / quiz.questions.length) * 100)}%
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Accuracy Score
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSaveScore}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Save Results & Close
            </button>
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Retake Quiz
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
