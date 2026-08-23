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
import { LearnAdmLanding } from "./components/LearnAdmLanding";
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
  const [showLanding, setShowLanding] = useState(true);
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

  const handleUpdateProfile = async (updatedData: any) => {
    if (currentUser) {
      const { updateUserProfileInFirestore } = await import("./lib/userService");
      await updateUserProfileInFirestore(currentUser.uid, updatedData);
      setLearnerProfile((prev: any) => ({ ...prev, ...updatedData }));
    }
  };

  if (isAuthChecking || isProfileChecking) {
    return (
      <div className="min-h-screen bg-[#EEF3F8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#1D2B4F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#4B5875] font-semibold tracking-wider uppercase">Loading Learn Adm...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (showLanding) {
      return (
        <LearnAdmLanding 
          onGetStarted={() => setShowLanding(false)} 
        />
      );
    }

    return (
      <Login 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onBackToLanding={() => setShowLanding(true)}
      />
    );
  }

  return (
    <div className="min-h-screen selection:bg-[#FFD43B]/30">
      {view === "dashboard" && (
        <Dashboard
          progress={progress}
          subjects={subjects}
          currentUser={currentUser}
          learnerProfile={learnerProfile}
          onUpdateProfile={handleUpdateProfile}
          onSignOut={handleSignOut}
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

      {view === "study" && selectedSubject && selectedTopicId && (
        <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <StudyRoom
              subject={selectedSubject}
              topicId={selectedTopicId}
              progress={progress}
              onBack={() => setView("dashboard")}
              onMarkComplete={handleMarkComplete}
              onStartQuiz={(subject, topicId) => {
                setSelectedSubject(subject);
                setSelectedTopicId(topicId);
                setView("quiz");
              }}
            />
          </div>
        </div>
      )}

      {view === "quiz" && selectedSubject && selectedTopicId && (
        <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <QuizRoom
              subject={selectedSubject}
              topicId={selectedTopicId}
              onBack={() => setView("dashboard")}
              onSaveScore={handleSaveScore}
            />
          </div>
        </div>
      )}

      {view === "daily" && (
        <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <DailyPracticeRoom
              progress={progress}
              onBack={() => setView("dashboard")}
              onCompleteDaily={handleCompleteDaily}
            />
          </div>
        </div>
      )}
    </div>
  );
}

