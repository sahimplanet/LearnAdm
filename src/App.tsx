import React, { useState, useEffect } from "react";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useParams, 
  useLocation,
  Link
} from "react-router-dom";
import { UserProgress, Subject, Topic } from "./types";
import { DEFAULT_SUBJECTS } from "./data/defaultSubjects";
import { Dashboard } from "./components/Dashboard";
import { StudyRoom } from "./components/StudyRoom";
import { QuizRoom } from "./components/QuizRoom";
import { DailyPracticeRoom } from "./components/DailyPracticeRoom";
import { Login } from "./components/Login";
import { LearnAdmLanding } from "./components/LearnAdmLanding";
import { ConfirmPassword } from "./components/ConfirmPassword";
import { VerifyEmail } from "./components/VerifyEmail";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { ensureUserInFirestore } from "./lib/userService";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Learner Profile state from Firestore
  const [learnerProfile, setLearnerProfile] = useState<any | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Listen to Firebase Auth state
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

  // Save selected grade
  useEffect(() => {
    localStorage.setItem("study_selected_grade", String(selectedGrade));
  }, [selectedGrade]);

  // Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem("study_progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("study_subjects", JSON.stringify(subjects));
  }, [subjects]);

  // Handle study streak decay checks on startup
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastActive = progress.lastActiveDate;
    
    if (lastActive && lastActive !== todayStr) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      lastDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        setProgress((prev) => ({
          ...prev,
          streak: 0
        }));
      }
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLearnerProfile(null);
      navigate("/login");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  // Update streak logic and append to activity logs
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
        newStreak = prev.streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

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

  return (
    <Routes>
      {/* 1. LANDING PAGE (/) */}
      <Route 
        path="/" 
        element={
          <LearnAdmLanding 
            onGetStarted={() => navigate(currentUser ? "/dashboard" : "/signup")}
            onSignIn={() => navigate("/login")}
            onSignUp={() => navigate("/signup")}
          />
        } 
      />

      {/* 2. LOGIN PAGE (/login) */}
      <Route 
        path="/login" 
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              initialTab="signin"
              initialPanel="auth"
              onLoginSuccess={() => navigate("/dashboard")}
              onBackToLanding={() => navigate("/")}
            />
          )
        } 
      />

      {/* 3. SIGNUP PAGE (/signup) */}
      <Route 
        path="/signup" 
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              initialTab="signup"
              initialPanel="auth"
              onLoginSuccess={() => navigate("/dashboard")}
              onBackToLanding={() => navigate("/")}
            />
          )
        } 
      />

      {/* 4. RESET PASSWORD (/reset-password, /resetpassword, /forgot-password) */}
      <Route 
        path="/reset-password" 
        element={
          <Login 
            initialTab="signin"
            initialPanel="forgot"
            onLoginSuccess={() => navigate("/dashboard")}
            onBackToLanding={() => navigate("/login")}
          />
        } 
      />
      <Route path="/resetpassword" element={<Navigate to="/reset-password" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />

      {/* 5. CONFIRMING PASSWORD (/confirmingpasword, /confirmingpassword, /confirm-password, /confirm-reset) */}
      <Route path="/confirm-password" element={<ConfirmPassword />} />
      <Route path="/confirmingpassword" element={<ConfirmPassword />} />
      <Route path="/confirmingpasword" element={<ConfirmPassword />} />
      <Route path="/confirm-reset" element={<ConfirmPassword />} />

      {/* 5B. EMAIL VERIFICATION VIA RESEND (/verify-email, /confirm-email, /verifyemail) */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/confirm-email" element={<VerifyEmail />} />
      <Route path="/verifyemail" element={<VerifyEmail />} />
      <Route path="/confirmemail" element={<VerifyEmail />} />

      {/* 6. DASHBOARD PAGE (/dashboard) */}
      <Route 
        path="/dashboard" 
        element={
          !currentUser ? (
            <Navigate to="/login" replace />
          ) : (
            <Dashboard
              progress={progress}
              subjects={subjects}
              currentUser={currentUser}
              learnerProfile={learnerProfile}
              initialView="dashboard"
              onViewChange={(v) => {
                if (v === "profile") navigate("/profile");
              }}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              onSelectTopic={(subject, topicId) => {
                navigate(`/study/${subject.id}/${topicId}`);
              }}
              onSelectQuiz={(subject, topicId) => {
                navigate(`/quiz/${subject.id}/${topicId}`);
              }}
              selectedGrade={selectedGrade}
            />
          )
        } 
      />

      {/* 7. PROFILE PAGE (/profile) */}
      <Route 
        path="/profile" 
        element={
          !currentUser ? (
            <Navigate to="/login" replace />
          ) : (
            <Dashboard
              progress={progress}
              subjects={subjects}
              currentUser={currentUser}
              learnerProfile={learnerProfile}
              initialView="profile"
              onViewChange={(v) => {
                if (v === "dashboard") navigate("/dashboard");
              }}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              onSelectTopic={(subject, topicId) => {
                navigate(`/study/${subject.id}/${topicId}`);
              }}
              onSelectQuiz={(subject, topicId) => {
                navigate(`/quiz/${subject.id}/${topicId}`);
              }}
              selectedGrade={selectedGrade}
            />
          )
        } 
      />

      {/* 8. STUDY PAGE (/study, /study/:subjectId/:topicId, /study/:topicId) */}
      <Route 
        path="/study" 
        element={
          <StudyRouteWrapper 
            subjects={subjects} 
            progress={progress} 
            onMarkComplete={handleMarkComplete} 
          />
        } 
      />
      <Route 
        path="/study/:subjectId/:topicId" 
        element={
          <StudyRouteWrapper 
            subjects={subjects} 
            progress={progress} 
            onMarkComplete={handleMarkComplete} 
          />
        } 
      />
      <Route 
        path="/study/:topicId" 
        element={
          <StudyRouteWrapper 
            subjects={subjects} 
            progress={progress} 
            onMarkComplete={handleMarkComplete} 
          />
        } 
      />

      {/* 9. QUIZ PAGE (/quiz, /quiz/:subjectId/:topicId, /quiz/:topicId) */}
      <Route 
        path="/quiz" 
        element={
          <QuizRouteWrapper 
            subjects={subjects} 
            onSaveScore={handleSaveScore} 
          />
        } 
      />
      <Route 
        path="/quiz/:subjectId/:topicId" 
        element={
          <QuizRouteWrapper 
            subjects={subjects} 
            onSaveScore={handleSaveScore} 
          />
        } 
      />
      <Route 
        path="/quiz/:topicId" 
        element={
          <QuizRouteWrapper 
            subjects={subjects} 
            onSaveScore={handleSaveScore} 
          />
        } 
      />

      {/* 10. DAILY PRACTICE (/daily, /practice) */}
      <Route 
        path="/daily" 
        element={
          <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <DailyPracticeRoom
                progress={progress}
                onBack={() => navigate("/dashboard")}
                onCompleteDaily={handleCompleteDaily}
              />
            </div>
          </div>
        } 
      />
      <Route path="/practice" element={<Navigate to="/daily" replace />} />

      {/* 11. CATCH-ALL REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper for /study routes with parameter resolution
function StudyRouteWrapper({
  subjects,
  progress,
  onMarkComplete
}: {
  subjects: Subject[];
  progress: UserProgress;
  onMarkComplete: (topicId: string, subjectName: string, topicName: string) => void;
}) {
  const navigate = useNavigate();
  const { subjectId, topicId } = useParams();

  // Find subject and topic
  let targetSubject: Subject | undefined;
  let targetTopicId: string | undefined = topicId;

  if (subjectId) {
    targetSubject = subjects.find((s) => s.id === subjectId);
  }

  // If subject was not found by subjectId, search by topicId
  if (!targetSubject && topicId) {
    targetSubject = subjects.find((s) => s.topics.some((t) => t.id === topicId));
  }

  // Fallback to first available subject and topic if missing
  if (!targetSubject) {
    targetSubject = subjects[0];
  }

  if (!targetTopicId && targetSubject?.topics?.[0]) {
    targetTopicId = targetSubject.topics[0].id;
  } else if (!targetTopicId) {
    targetTopicId = "topic-default";
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <StudyRoom
          subject={targetSubject}
          topicId={targetTopicId}
          progress={progress}
          onBack={() => navigate("/dashboard")}
          onMarkComplete={onMarkComplete}
          onStartQuiz={(subj, tId) => {
            navigate(`/quiz/${subj.id}/${tId}`);
          }}
        />
      </div>
    </div>
  );
}

// Wrapper for /quiz routes with parameter resolution
function QuizRouteWrapper({
  subjects,
  onSaveScore
}: {
  subjects: Subject[];
  onSaveScore: (topicId: string, score: number, subjectName: string, topicName: string) => void;
}) {
  const navigate = useNavigate();
  const { subjectId, topicId } = useParams();

  let targetSubject: Subject | undefined;
  let targetTopicId: string | undefined = topicId;

  if (subjectId) {
    targetSubject = subjects.find((s) => s.id === subjectId);
  }

  if (!targetSubject && topicId) {
    targetSubject = subjects.find((s) => s.topics.some((t) => t.id === topicId));
  }

  if (!targetSubject) {
    targetSubject = subjects[0];
  }

  if (!targetTopicId && targetSubject?.topics?.[0]) {
    targetTopicId = targetSubject.topics[0].id;
  } else if (!targetTopicId) {
    targetTopicId = "topic-default";
  }

  return (
    <div className="min-h-screen bg-[#EEF3F8] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <QuizRoom
          subject={targetSubject}
          topicId={targetTopicId}
          onBack={() => navigate("/dashboard")}
          onSaveScore={(tId, score, sName, topName) => {
            onSaveScore(tId, score, sName, topName);
            navigate("/dashboard");
          }}
        />
      </div>
    </div>
  );
}
