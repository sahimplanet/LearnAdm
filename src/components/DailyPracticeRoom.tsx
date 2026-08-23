import React, { useState, useEffect } from "react";
import { UserProgress, DailyPractice, DailyPracticeQuestion } from "../types";
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  Loader2, 
  Award, 
  Flame,
  HelpCircle,
  RefreshCw,
  BookOpen,
  Calendar
} from "lucide-react";

interface DailyPracticeRoomProps {
  progress: UserProgress;
  onBack: () => void;
  onCompleteDaily: (date: string) => void;
}

export const DailyPracticeRoom: React.FC<DailyPracticeRoomProps> = ({
  progress,
  onBack,
  onCompleteDaily
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const isCompletedAlready = progress.completedDailyPractice.includes(todayStr);

  const storageKey = `daily_practice_progress_${todayStr}`;

  // State
  const [practice, setPractice] = useState<DailyPractice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isResumed, setIsResumed] = useState(false);

  // Load from localStorage or Fetch Daily Practice on Mount
  useEffect(() => {
    let active = true;

    // Check localStorage for saved daily practice progress
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.practice &&
          Array.isArray(parsed.practice.questions) &&
          parsed.practice.questions.length > 0 &&
          !parsed.completed
        ) {
          if (active) {
            setPractice(parsed.practice);
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
      console.warn("Error restoring daily practice progress from localStorage:", e);
    }

    const fetchDaily = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/daily-practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: todayStr })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status} failed to load daily practice.`);
        }

        const data = await response.json();
        if (active) {
          setPractice(data);
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                practice: data,
                currentIdx: 0,
                selectedIdx: null,
                answered: false,
                score: 0,
                completed: false,
                updatedAt: Date.now()
              })
            );
          } catch (err) {
            console.warn("Could not save initial daily practice state:", err);
          }
        }
      } catch (err: any) {
        console.error("Error fetching daily practice:", err);
        if (active) {
          setError(err.message || "Failed to fetch today's practice lesson.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDaily();
    return () => {
      active = false;
    };
  }, [todayStr, storageKey]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (!practice) return;
    try {
      if (completed) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            practice,
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
      console.warn("Error updating daily practice progress in localStorage:", err);
    }
  }, [practice, currentIdx, selectedIdx, answered, score, completed, storageKey]);

  // Option select
  const handleOptionClick = (idx: number) => {
    if (answered || !practice) return;
    
    setSelectedIdx(idx);
    setAnswered(true);
    
    const correctIdx = practice.questions[currentIdx].correctOptionIndex;
    if (idx === correctIdx) {
      setScore((prev) => prev + 1);
    }
  };

  // Next question
  const handleNext = () => {
    if (!practice) return;

    if (currentIdx + 1 < practice.questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
      // Trigger completion callback!
      onCompleteDaily(todayStr);
    }
  };

  const activeQuestion = practice?.questions[currentIdx];

  // Helper formatting for date
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-800 text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>
        <div className="text-right flex items-center gap-1.5 text-xs font-bold text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {todayStr}
        </div>
      </div>

      {/* Already completed header banner */}
      {isCompletedAlready && !completed && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-emerald-800 text-xs flex items-center gap-3">
          <div className="p-1 rounded-full bg-emerald-500 text-white shadow-xs shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong>Excellent habits!</strong> You have already completed today's daily focus challenge and safely protected your learning streak. You can still retake or review today's nugget lesson below.
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-indigo-600 mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-950 text-lg tracking-tight">Igniting Today's Brain Spark</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Our AI academic tutor is writing today’s bite-sized cognitive nugget and drafting quick concept-checking exercises.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white border border-rose-100 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-bold text-gray-950 text-base">Brain Spark Notice</h3>
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

      {/* Active Practice Screen */}
      {practice && !completed && (
        <div className="space-y-6">
          {/* Concept Nugget Intro Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                  Daily Study Micro-Lesson
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-indigo-600 font-bold">{formattedToday}</p>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950">
                  {practice.title}
                </h2>
              </div>
              
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-5">
                {practice.conceptIntro}
              </p>
            </div>
          </div>

          {/* Interactive Exercise Question */}
          {activeQuestion && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span className="text-indigo-600">Question {currentIdx + 1} of {practice.questions.length}</span>
                  <span>Practice Exercise</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / practice.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question text */}
              <h3 className="font-bold text-gray-950 text-sm md:text-base leading-snug tracking-tight">
                {activeQuestion.question}
              </h3>

              {/* Question Options */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {activeQuestion.options.map((option, idx) => {
                  const isCorrect = idx === activeQuestion.correctOptionIndex;
                  const isSelected = idx === selectedIdx;

                  let optionClass = "bg-gray-50/60 hover:bg-gray-100/50 border-gray-100 text-gray-700";
                  if (answered) {
                    if (isCorrect) {
                      optionClass = "bg-emerald-50 border-emerald-100 text-emerald-800 font-semibold";
                    } else if (isSelected) {
                      optionClass = "bg-rose-50 border-rose-100 text-rose-800 font-semibold";
                    } else {
                      optionClass = "bg-gray-50/30 opacity-50 border-gray-100 text-gray-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={answered}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs md:text-sm transition-all flex items-center justify-between group ${optionClass} ${
                        !answered ? "cursor-pointer hover:border-gray-300" : ""
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {answered && isCorrect && (
                        <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      {answered && isSelected && !isCorrect && (
                        <span className="p-0.5 rounded-full bg-rose-500 text-white">
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section */}
              {answered && (
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-lg space-y-2 animate-fade-in text-xs leading-relaxed">
                  <h4 className="font-bold text-gray-950 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Lesson Solution Breakdown
                  </h4>
                  <p className="text-gray-500">
                    {activeQuestion.explanation}
                  </p>
                  
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {currentIdx + 1 === practice.questions.length ? "Finish Exercise" : "Next Exercise"} 
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completion screen */}
      {completed && practice && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-12 text-center space-y-6 animate-fade-in">
          
          <div className="inline-flex relative">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Flame className="w-8 h-8 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              +1
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-wider">
              Workout Complete
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight mt-2">
              Habit Locked In!
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
              Congratulations! You completed today's practice questions, scoring <strong className="text-gray-700">{score} of {practice.questions.length} correct</strong> and fueling your active study streak.
            </p>
          </div>

          {/* Streak Counter display */}
          <div className="py-2">
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-orange-50/50 border border-orange-100 rounded-lg min-w-44 justify-center">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <div className="text-left">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Your Streak</div>
                <div className="text-xl font-bold text-gray-950 leading-none mt-1.5">
                  {progress.streak} {progress.streak === 1 ? "Day" : "Days"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Claim Daily Spark & Close
          </button>
        </div>
      )}
    </div>
  );
};
