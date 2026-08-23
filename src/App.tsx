import React, { useState, useEffect } from "react";
import { UserProgress, Subject, Topic } from "./types";
import { DEFAULT_SUBJECTS } from "./data/defaultSubjects";
import { Dashboard } from "./components/Dashboard";
import { SubjectExplorer } from "./components/SubjectExplorer";
import { StudyRoom } from "./components/StudyRoom";
import { QuizRoom } from "./components/QuizRoom";
import { DailyPracticeRoom } from "./components/DailyPracticeRoom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { ensureUserInFirestore } from "./lib/userService";
import { Login } from "./components/Login";
import { LearnerOnboarding } from "./components/LearnerOnboarding";
import { NextReadLogo } from "./components/NextReadLogo";
import { 
  Home, 
  BookOpen, 
  CalendarDays, 
  Flame, 
  GraduationCap, 
  Award,
  Zap,
  Info,
  Loader2,
  LogOut,
  User as UserIcon,
  Settings
} from "lucide-react";

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Learner Profile state from Firestore
  const [learnerProfile, setLearnerProfile] = useState<any | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Navigation / Router view state
  const [view, setView] = useState<"dashboard" | "explore" | "study" | "quiz" | "daily">("dashboard");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsProfileChecking(true);
        let profileFound = null;

        try {
          profileFound = await ensureUserInFirestore(user);
        } catch (err: any) {
          console.warn("Firestore user sync notice:", err?.message || err);
        }

        setLearnerProfile(profileFound);
        setIsProfileChecking(false);
      } else {
        setLearnerProfile(null);
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLearnerProfile(null);
      setShowProfileEdit(false);
      setView("dashboard");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  // Active Grade selection state (Grade 1 to Grade 9)
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    const saved = localStorage.getItem("study_selected_grade");
    return saved ? parseInt(saved, 10) : 7; // default to grade 7
  });

  // App Curriculums and Syllabus lists state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("study_subjects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If they have less than 50 subjects, it's the old database.
        // Force-load all DEFAULT_SUBJECTS and preserve any custom subjects they made.
        if (parsed.length >= 50) {
          return parsed;
        }
        const customSubjects = parsed.filter((s: any) => s.isCustom);
        return [...DEFAULT_SUBJECTS, ...customSubjects];
      } catch (e) {
        console.error("Error loading subjects:", e);
      }
    }
    return DEFAULT_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem("study_selected_grade", String(selectedGrade));
  }, [selectedGrade]);

  // User Statistics & Learning Journey Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("study_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading progress:", e);
      }
    }
    return {
      completedTopics: [],
      quizScores: {},
      streak: 0,
      lastActiveDate: null,
      completedDailyPractice: [],
      studyMinutes: 0,
      activities: []
    };
  });

  // Persist State to Local Storage on updates
  useEffect(() => {
    localStorage.setItem("study_progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("study_subjects", JSON.stringify(subjects));
  }, [subjects]);

  // Handle study streak decay checks on application startup
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastActive = progress.lastActiveDate;
    
    if (lastActive && lastActive !== todayStr) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      // Set hours to 0 to compare full days
      lastDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Streak has expired since they missed at least a whole day!
        setProgress((prev) => ({
          ...prev,
          streak: 0
        }));
      }
    }
  }, []);

  // Update streak logic and append to recent activity logs
  const updateStreakAndActivity = (
    prev: UserProgress, 
    action: "read" | "quiz" | "daily", 
    details: string, 
    subjectName: string, 
    topicName: string
  ): UserProgress => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastActive = prev.lastActiveDate;
    
    let newStreak = prev.streak;
    
    if (!lastActive) {
      newStreak = 1;
    } else if (lastActive !== todayStr) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      lastDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Perfect habit loop, increment by 1
        newStreak = prev.streak + 1;
      } else if (diffDays > 1) {
        // Reset streak to 1 today
        newStreak = 1;
      }
    }
    // If lastActive === todayStr, streak remains same, avoiding multiple increments on same day

    const newActivity = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      action,
      subjectName,
      topicName,
      details
    };

    return {
      ...prev,
      streak: newStreak,
      lastActiveDate: todayStr,
      activities: [newActivity, ...prev.activities]
    };
  };

  // Actions Callbacks
  const handleMarkComplete = (topicId: string, subjectName: string, topicName: string) => {
    setProgress((prev) => {
      if (prev.completedTopics.includes(topicId)) return prev;
      
      const updatedCompleted = [...prev.completedTopics, topicId];
      return updateStreakAndActivity(
        {
          ...prev,
          completedTopics: updatedCompleted,
          studyMinutes: prev.studyMinutes + 15
        },
        "read",
        `Fully reviewed topic summary and flashcards`,
        subjectName,
        topicName
      );
    });
  };

  const handleSaveScore = (topicId: string, score: number, subjectName: string, topicName: string) => {
    setProgress((prev) => {
      const prevScore = prev.quizScores[topicId] || 0;
      const updatedScores = {
        ...prev.quizScores,
        [topicId]: Math.max(prevScore, score)
      };

      // Auto-mark completed if they scored on a quiz!
      const updatedCompleted = prev.completedTopics.includes(topicId)
        ? prev.completedTopics
        : [...prev.completedTopics, topicId];

      return updateStreakAndActivity(
        {
          ...prev,
          quizScores: updatedScores,
          completedTopics: updatedCompleted,
          studyMinutes: prev.studyMinutes + 10
        },
        "quiz",
        `Completed practice assessment with a score of ${score}%`,
        subjectName,
        topicName
      );
    });
    setView("explore");
  };

  const handleCompleteDaily = (dateStr: string) => {
    setProgress((prev) => {
      if (prev.completedDailyPractice.includes(dateStr)) return prev;

      const updatedDaily = [...prev.completedDailyPractice, dateStr];
      return updateStreakAndActivity(
        {
          ...prev,
          completedDailyPractice: updatedDaily,
          studyMinutes: prev.studyMinutes + 10
        },
        "daily",
        `Completed today's bite-sized Brain Spark focus practice`,
        "Daily Practice",
        "Brain Spark"
      );
    });
  };

  // Generates custom syllabus course from Gemini
  const handleCreateCustomSubject = async (subjectName: string) => {
    const response = await fetch("/api/ai/custom-subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjectName, grade: selectedGrade })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Tutor server was unable to formulate curriculum. Try again.");
    }

    const newSubject = await response.json();
    newSubject.grade = selectedGrade; // Stamp the current active grade
    setSubjects((prev) => {
      // Filter out duplicates if same name exists
      const filtered = prev.filter((s) => s.name.toLowerCase() !== newSubject.name.toLowerCase());
      return [...filtered, newSubject];
    });

    setProgress((prev) => {
      const newActivity = {
        id: `act-${Date.now()}`,
        date: new Date().toISOString(),
        action: "read" as const,
        subjectName: newSubject.name,
        topicName: "Syllabus Roadmap",
        details: `Created a brand-new custom syllabus path: "${newSubject.name}"`
      };
      return {
        ...prev,
        activities: [newActivity, ...prev.activities]
      };
    });
  };

  if (isAuthChecking || isProfileChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Connecting to Firestore & Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // If learner profile has not been completed yet, or if user explicitly wants to edit/view profile
  if (!learnerProfile || showProfileEdit) {
    return (
      <LearnerOnboarding
        user={currentUser}
        initialData={learnerProfile}
        isModalMode={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onAccountDeleted={() => handleSignOut()}
        onComplete={(profileData) => {
          setLearnerProfile(profileData);
          setShowProfileEdit(false);
        }}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-950 font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Dynamic Header Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <NextReadLogo size="sm" className="scale-75 -ml-3" />
            <div>
              <span className="font-black text-gray-950 tracking-tight text-base leading-none block">
                learnadm
              </span>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider leading-none mt-0.5 block">
                CBE Learning
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setView("dashboard")}
              className={`py-5 transition-all cursor-pointer border-b-2 ${
                view === "dashboard" 
                  ? "border-indigo-600 text-indigo-600 font-semibold" 
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* Right Streak / Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-gray-950 font-semibold text-xs" title="Your daily study streak">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{progress.streak} Day Streak</span>
            </div>

            {/* User Profile Info & Logout */}
            {currentUser && (
              <div className="flex items-center gap-3 border-l border-gray-100 pl-4 ml-1.5" id="user-header-profile">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-gray-900 leading-none">
                    {learnerProfile?.name || currentUser.displayName || currentUser.email?.split("@")[0] || "Learner"}
                  </span>
                  <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider mt-1 block">
                    {learnerProfile?.grade || "Learner"} • {learnerProfile?.chosedSubject || "CBE"}
                  </span>
                </div>

                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 hover:bg-indigo-100 transition-colors cursor-pointer"
                  title="View / Edit Firestore Learner Profile"
                  id="edit-profile-btn"
                >
                  <UserIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  title="Sign Out of App"
                  id="header-signout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content stage */}
      <main className="flex-1 bg-gray-50/50">
        <div className="max-w-7xl w-full mx-auto px-6 py-8">
        
        {view === "dashboard" && (
          <Dashboard
            progress={progress}
            subjects={subjects}
            onNavigate={(targetView) => setView(targetView)}
            onSelectTopic={(subject, topicId) => {
              setSelectedSubject(subject);
              setSelectedTopicId(topicId);
              setView("study");
            }}
            onSelectQuiz={(subject, topicId) => {
              setSelectedSubject(subject);
              setSelectedTopicId(topicId);
              setView("quiz");
            }}
            selectedGrade={selectedGrade}
          />
        )}

        {view === "explore" && (
          <SubjectExplorer
            subjects={subjects}
            progress={progress}
            onSelectTopic={(subject, topicId) => {
              setSelectedSubject(subject);
              setSelectedTopicId(topicId);
              setView("study");
            }}
            onSelectQuiz={(subject, topicId) => {
              setSelectedSubject(subject);
              setSelectedTopicId(topicId);
              setView("quiz");
            }}
            onCreateCustomSubject={handleCreateCustomSubject}
            selectedGrade={selectedGrade}
            onSelectGrade={setSelectedGrade}
          />
        )}

        {view === "study" && selectedSubject && selectedTopicId && (
          <StudyRoom
            subject={selectedSubject}
            topicId={selectedTopicId}
            progress={progress}
            onBack={() => setView("explore")}
            onMarkComplete={handleMarkComplete}
            onStartQuiz={(subject, topicId) => {
              setSelectedSubject(subject);
              setSelectedTopicId(topicId);
              setView("quiz");
            }}
          />
        )}

        {view === "quiz" && selectedSubject && selectedTopicId && (
          <QuizRoom
            subject={selectedSubject}
            topicId={selectedTopicId}
            onBack={() => setView("explore")}
            onSaveScore={handleSaveScore}
          />
        )}

        {view === "daily" && (
          <DailyPracticeRoom
            progress={progress}
            onBack={() => setView("dashboard")}
            onCompleteDaily={handleCompleteDaily}
          />
        )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400 font-medium shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} STUDIO. All rights reserved.</p>
          <div className="flex gap-6 text-gray-400">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-600" /> Continuous Recall</span>
            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-indigo-600" /> AI Syllabus Tutor</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Tab bar navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6 flex items-center justify-center z-30">
        <button 
          onClick={() => setView("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
            view === "dashboard" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
}
