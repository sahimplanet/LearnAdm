import React, { useState } from "react";
import { UserProgress, Subject, ActivityLog, Topic } from "../types";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  GraduationCap, 
  Search, 
  Filter, 
  ArrowRight, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Sparkles,
  BarChart2,
  Check,
  TrendingUp,
  Target
} from "lucide-react";

interface DashboardProps {
  progress: UserProgress;
  subjects: Subject[];
  onNavigate: (view: "explore" | "daily") => void;
  onSelectTopic: (subject: Subject, topicId: string) => void;
  onSelectQuiz?: (subject: Subject, topicId: string) => void;
  selectedGrade?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  subjects,
  onNavigate,
  onSelectTopic,
  onSelectQuiz,
  selectedGrade = 7
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed" | "not_started">("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Toggle expansion for subject topic details
  const toggleSubjectExpanded = (subjectId: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Compute total subjects stats
  const totalCompletedTopicsCount = progress.completedTopics.length;
  const totalQuizScoresList = Object.values(progress.quizScores) as number[];
  const globalAverageScore = totalQuizScoresList.length > 0 
    ? Math.round(totalQuizScoresList.reduce((a, b) => a + b, 0) / totalQuizScoresList.length) 
    : 0;

  // Filter subjects based on search, grade filter, and status
  const filteredSubjects = subjects.filter(subject => {
    // Search match
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.topics.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Grade match
    if (gradeFilter !== "all") {
      const subjectGrade = subject.grade || 7;
      if (subjectGrade !== gradeFilter) return false;
    }

    // Status match
    const totalTopics = subject.topics.length;
    const completedCount = subject.topics.filter(t => progress.completedTopics.includes(t.id)).length;
    
    if (statusFilter === "completed") {
      return totalTopics > 0 && completedCount === totalTopics;
    }
    if (statusFilter === "in_progress") {
      return completedCount > 0 && completedCount < totalTopics;
    }
    if (statusFilter === "not_started") {
      return completedCount === 0;
    }

    return true;
  });

  // Calculate stats for a specific subject
  const getSubjectStats = (subject: Subject) => {
    const totalTopics = subject.topics.length;
    const completedTopics = subject.topics.filter(t => progress.completedTopics.includes(t.id));
    const completedCount = completedTopics.length;
    const percentComplete = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    // Subject quiz scores
    const subjectQuizScores = subject.topics
      ? subject.topics
          .map(t => progress.quizScores[t.id])
          .filter((score): score is number => score !== undefined)
      : [];

    const bestQuizScore = subjectQuizScores.length > 0 ? Math.max(...subjectQuizScores) : null;
    const avgQuizScore = subjectQuizScores.length > 0
      ? Math.round(subjectQuizScores.reduce((a, b) => a + b, 0) / subjectQuizScores.length)
      : null;

    // Filter activities for this subject
    const subjectActivities = progress.activities.filter(
      act => act.subjectName.toLowerCase() === subject.name.toLowerCase()
    );

    const lastActivity = subjectActivities.length > 0 ? subjectActivities[0] : null;

    return {
      totalTopics,
      completedCount,
      percentComplete,
      bestQuizScore,
      avgQuizScore,
      subjectActivities,
      lastActivity
    };
  };

  return (
    <div className="space-y-8 animate-fade-in" id="learner-history-dashboard">
      
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3 text-indigo-600" /> Learner History & Subject Log
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-950 tracking-tight">
              Academic History Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Track your complete learning history, completed topics, assessment scores, and historical activity records across every CBE subject.
            </p>
          </div>

          <button
            onClick={() => onNavigate("explore")}
            className="self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm shrink-0"
            id="dashboard-explore-cta"
          >
            <span>Explore CBE Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrolled Subjects</div>
              <div className="text-lg font-extrabold text-gray-950 mt-0.5">{subjects.length} Subjects</div>
              <div className="text-[10px] text-gray-400">Full CBE Curriculum</div>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Topics Mastered</div>
              <div className="text-lg font-extrabold text-gray-950 mt-0.5">{totalCompletedTopicsCount} Lessons</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Completed & Reviewed</div>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Quiz Score</div>
              <div className="text-lg font-extrabold text-gray-950 mt-0.5">{globalAverageScore}%</div>
              <div className="text-[10px] text-gray-400">{totalQuizScoresList.length} quizzes taken</div>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Study Time Spent</div>
              <div className="text-lg font-extrabold text-gray-950 mt-0.5">{progress.studyMinutes} Mins</div>
              <div className="text-[10px] text-gray-400">{progress.activities.length} activity logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject or topic history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-lg font-medium transition-all text-gray-900 placeholder-gray-400"
            id="subject-history-search"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase">Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer"
              id="grade-filter-select"
            >
              <option value="all">All Grades</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer"
              id="status-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Fully Completed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Subject History List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" /> Learner Progress by Subject ({filteredSubjects.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Showing detailed topics, quiz scores & activity timeline
          </span>
        </div>

        {filteredSubjects.length > 0 ? (
          <div className="space-y-6">
            {filteredSubjects.map((subject) => {
              const stats = getSubjectStats(subject);
              const isExpanded = expandedSubjects[subject.id] ?? true; // expanded by default

              return (
                <div 
                  key={subject.id} 
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-gray-200"
                  id={`subject-card-${subject.id}`}
                >
                  {/* Subject Header Banner */}
                  <div className="p-6 bg-slate-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                        {subject.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-extrabold text-gray-950 tracking-tight">
                            {subject.name}
                          </h3>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                            Grade {subject.grade || 7}
                          </span>
                          {subject.isCustom && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Custom Subject
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xl">
                          {subject.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Badge & Action */}
                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end text-xs font-bold text-gray-900">
                          <span>{stats.completedCount} / {stats.totalTopics} Topics Completed</span>
                          <span className="text-indigo-600 font-extrabold">{stats.percentComplete}%</span>
                        </div>
                        <div className="w-36 bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5 ml-auto">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${stats.percentComplete}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSubjectExpanded(subject.id)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse topics history" : "Expand topics history"}
                        id={`toggle-expand-${subject.id}`}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Topic History Details */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      
                      {/* Topic Breakdown Grid / Table */}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Syllabus Topics & Mastery Breakdown
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {subject.topics.map((topic) => {
                            const isCompleted = progress.completedTopics.includes(topic.id);
                            const quizScore = progress.quizScores[topic.id];
                            const hasTakenQuiz = quizScore !== undefined;

                            return (
                              <div 
                                key={topic.id}
                                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                                  isCompleted 
                                    ? "bg-emerald-50/30 border-emerald-100" 
                                    : "bg-white border-gray-100 hover:border-gray-200"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <h5 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      ) : (
                                        <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                                      )}
                                      <span>{topic.name}</span>
                                    </h5>

                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      isCompleted 
                                        ? "bg-emerald-100 text-emerald-700" 
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                      {isCompleted ? "Completed" : "In Progress"}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                    {topic.description}
                                  </p>
                                </div>

                                {/* Quiz Score & Actions */}
                                <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <Award className={`w-3.5 h-3.5 ${hasTakenQuiz ? "text-amber-500" : "text-gray-300"}`} />
                                    {hasTakenQuiz ? (
                                      <span className="font-extrabold text-amber-700 text-[11px]">
                                        Score: {quizScore}% {quizScore >= 80 ? "(Mastered)" : "(Passed)"}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-medium">No quiz score yet</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => onSelectTopic(subject, topic.id)}
                                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                      id={`study-btn-${topic.id}`}
                                    >
                                      Study Lesson
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (onSelectQuiz) {
                                          onSelectQuiz(subject, topic.id);
                                        } else {
                                          onSelectTopic(subject, topic.id);
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                      id={`quiz-btn-${topic.id}`}
                                    >
                                      Take Quiz
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subject Activity History Log */}
                      <div className="bg-slate-50/60 border border-gray-100 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-indigo-600" /> Recent Activity History for {subject.name}
                        </h4>

                        {stats.subjectActivities.length > 0 ? (
                          <div className="space-y-2">
                            {stats.subjectActivities.slice(0, 4).map((act) => (
                              <div key={act.id} className="bg-white p-3 rounded-lg border border-gray-100/80 flex items-start gap-3 text-xs">
                                <div className="mt-0.5 shrink-0">
                                  {act.action === "read" && <BookOpen className="w-3.5 h-3.5 text-indigo-600" />}
                                  {act.action === "quiz" && <Award className="w-3.5 h-3.5 text-emerald-600" />}
                                  {act.action === "daily" && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 leading-snug">{act.details}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                    <span className="font-bold text-gray-600">{act.topicName}</span>
                                    <span>&bull;</span>
                                    <span>{formatActivityTime(act.date)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 py-2 italic">
                            No study or assessment history logged yet for this subject. Click "Study Lesson" above to get started!
                          </p>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">No Subject History Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No subjects matched your filter criteria "{searchQuery}". Try resetting filters or explore the full CBE syllabus.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setGradeFilter("all");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

function formatActivityTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch (e) {
    return "Recently";
  }
}
