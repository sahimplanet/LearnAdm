import React, { useState } from "react";
import { Subject, UserProgress } from "../types";
import { 
  Sparkles, 
  ChevronRight, 
  CheckCircle, 
  HelpCircle, 
  Plus, 
  Search, 
  Loader2,
  BookOpen,
  FlaskConical,
  Calculator,
  Cpu,
  GraduationCap,
  CalendarDays,
  Bookmark,
  Languages,
  Compass,
  Heart,
  Palette,
  Sprout
} from "lucide-react";

// Helper component to render Icons based on pre-mapped strings safely
export const IconRenderer: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const icons: Record<string, any> = {
    FlaskConical,
    Calculator,
    BookOpen,
    Cpu,
    GraduationCap,
    Languages,
    Compass,
    Heart,
    Palette,
    Sprout
  };
  const IconComponent = icons[name] || GraduationCap;
  return <IconComponent className={className} />;
};

interface SubjectExplorerProps {
  subjects: Subject[];
  progress: UserProgress;
  onSelectTopic: (subject: Subject, topicId: string) => void;
  onSelectQuiz: (subject: Subject, topicId: string) => void;
  onCreateCustomSubject: (subjectName: string) => Promise<void>;
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
}

export const SubjectExplorer: React.FC<SubjectExplorerProps> = ({
  subjects,
  progress,
  onSelectTopic,
  onSelectQuiz,
  onCreateCustomSubject,
  selectedGrade,
  onSelectGrade
}) => {
  const [customInput, setCustomInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Suggested tags for custom subject creation based on active grade
  const getSuggestionsForGrade = (grade: number) => {
    if (grade <= 3) {
      return [
        "Phonics Spelling",
        "Animal Habitats",
        "Addition Stories",
        "Finger Painting",
        "Caring for Plants"
      ];
    } else if (grade <= 6) {
      return [
        "Human Digestion",
        "Fractions & Ratios",
        "Patriotic Songs",
        "County Geography",
        "Compost Making"
      ];
    } else {
      return [
        "Astrophysics",
        "Intro to Economics",
        "Web Development",
        "Quantum Computing",
        "Ancient Rome"
      ];
    }
  };

  const suggestions = getSuggestionsForGrade(selectedGrade);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await onCreateCustomSubject(customInput.trim());
      setCustomInput("");
    } catch (err: any) {
      console.error(err);
      setGenerationError(
        err.message || "Failed to generate custom syllabus. Please check your network or try another subject name."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter subjects based on selectedGrade
  const filteredSubjects = subjects.filter((subject) => {
    // If the subject has an explicit grade, match it
    if (subject.grade !== undefined) {
      return subject.grade === selectedGrade;
    }
    // Backward compatibility: default to Grade 7
    return selectedGrade === 7;
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Search and Generate Banner */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded">
            CBE Syllabus Creator (Grade {selectedGrade})
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-950 flex items-center gap-2 tracking-tight mt-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" /> What CBE Syllabus subject would you like to study today?
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Select an academic CBE subject below, or type in ANY custom subject you want to master for CBE Grade {selectedGrade}. Our AI syllabus engine will instantly construct an interactive 4-chapter CBE syllabus, study roadmap, and concept-checking quizzes tailored specifically for you.
          </p>
        </div>

        {/* Syllabus Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder={`e.g. Science projects, Grade ${selectedGrade} lessons, Reading challenges...`}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={isGenerating}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm rounded-lg outline-none text-gray-950 placeholder-gray-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !customInput.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Syllabus...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Generate Syllabus
                </>
              )}
            </button>
          </div>

          {/* Suggested inputs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-semibold text-gray-400">Popular roadmaps:</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setCustomInput(suggestion)}
                disabled={isGenerating}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors cursor-pointer font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Generation Loading State Feedback */}
          {isGenerating && (
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Loader2 className="w-4 h-4 animate-spin" /> Curating Syllabus Roadmap
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Please wait a few seconds. The AI tutor is breaking down the subject, organizing logical learning modules, drafting core concepts, and prepping interactive quiz modules for your personalized roadmap.
              </p>
            </div>
          )}

          {/* Error Message */}
          {generationError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg space-y-2 text-xs leading-relaxed">
              <p className="font-bold">Syllabus Generation Notice</p>
              <p>{generationError}</p>
              <p className="text-gray-400 font-medium mt-1">
                Tip: Make sure your GEMINI_API_KEY is correctly configured inside AI Studio’s Settings &gt; Secrets panel if this is a fresh setup.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Grade Selector Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4.5 h-4.5 text-indigo-600" /> Select CBE Grade Level
          </h3>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
            CBE Grade {selectedGrade} Syllabus Active
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent snap-x">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gradeNum) => {
            const isActive = selectedGrade === gradeNum;
            return (
              <button
                key={gradeNum}
                type="button"
                onClick={() => onSelectGrade(gradeNum)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 snap-start cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]"
                    : "bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 border border-gray-100 hover:border-indigo-100"
                }`}
              >
                <GraduationCap className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-indigo-500"}`} />
                CBE Grade {gradeNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-600" /> Active CBE Syllabus Subjects
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => {
            // Count completed topics in this subject
            const totalTopics = subject.topics.length;
            const completedTopicsCount = subject.topics.filter(t => 
              progress.completedTopics.includes(t.id)
            ).length;
            
            const firstTopic = subject.topics[0];
            
            return (
              <div 
                key={subject.id}
                className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => {
                  if (firstTopic) {
                    onSelectTopic(subject, firstTopic.id);
                  }
                }}
              >
                <div className="space-y-4">
                  {/* Subject Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-xs">
                        <IconRenderer name={subject.iconName} className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-gray-950 group-hover:text-indigo-600 transition-colors leading-tight">
                          {subject.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            Grade {subject.grade || 7}
                          </span>
                          {subject.isCustom && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                              AI Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400">
                        {completedTopicsCount}/{totalTopics} Complete
                      </span>
                      {/* Mini progress bar */}
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500" 
                          style={{ width: `${totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed min-h-8">
                    {subject.description}
                  </p>

                  {/* Start First Strand Action Bar */}
                  {firstTopic && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTopic(subject, firstTopic.id);
                        }}
                        className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer group-hover:bg-indigo-600 group-hover:text-white shadow-xs"
                      >
                        <span className="truncate">Open First Strand: <strong className="uppercase">{firstTopic.name}</strong></span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  )}

                  {/* Topics List */}
                  <div className="space-y-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    {subject.topics.map((topic) => {
                      const isCompleted = progress.completedTopics.includes(topic.id);
                      const quizScore = progress.quizScores[topic.id];
                      
                      return (
                        <div 
                          key={topic.id}
                          className="p-3 bg-gray-50/60 hover:bg-gray-100/50 border border-gray-100 hover:border-gray-200 rounded-lg flex items-center justify-between transition-colors text-xs"
                        >
                          <div className="space-y-1 pr-4 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 fill-indigo-50 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white shrink-0" />
                              )}
                              <span className="font-semibold text-gray-800 leading-tight">
                                {topic.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 pl-5 line-clamp-1 leading-normal font-normal">
                              {topic.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Quiz Score Badge if attempted */}
                            {quizScore !== undefined ? (
                              <button
                                onClick={() => onSelectQuiz(subject, topic.id)}
                                className={`px-2 py-0.5 rounded font-bold text-[10px] border transition-colors cursor-pointer ${
                                  quizScore >= 80 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                                    : quizScore >= 50 
                                    ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100" 
                                    : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                                }`}
                                title="Click to retake Quiz"
                              >
                                Quiz: {quizScore}%
                              </button>
                            ) : (
                              <button
                                onClick={() => onSelectQuiz(subject, topic.id)}
                                className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 text-gray-500 rounded font-semibold text-[10px] transition-colors cursor-pointer flex items-center gap-0.5"
                              >
                                <HelpCircle className="w-3 h-3 text-indigo-600" /> Quiz
                              </button>
                            )}

                            <button 
                              onClick={() => onSelectTopic(subject, topic.id)}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded transition-colors cursor-pointer"
                              title="Start Learning"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
