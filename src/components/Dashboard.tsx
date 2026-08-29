import React, { useState, useEffect } from "react";
import { UserProgress, Subject, Topic } from "../types";
import { deleteUserAccountFromFirestore } from "../lib/userService";

interface DashboardProps {
  progress: UserProgress;
  subjects: Subject[];
  currentUser: any;
  learnerProfile: any;
  onUpdateProfile: (updated: any) => Promise<void>;
  onSignOut: () => void;
  onSelectTopic: (subject: Subject, topicId: string) => void;
  onSelectQuiz?: (subject: Subject, topicId: string) => void;
  selectedGrade?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  subjects,
  currentUser,
  learnerProfile,
  onUpdateProfile,
  onSignOut,
  onSelectTopic,
  onSelectQuiz,
  selectedGrade = 7
}) => {
  // Navigation view inside Dashboard shell: "dashboard" | "profile"
  const [activeView, setActiveView] = useState<"dashboard" | "profile">("dashboard");

  // Selected active subject for Today's Card focus
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0);

  // Subject Picker Modal for "Start Learn"
  const [showSubjectPickerModal, setShowSubjectPickerModal] = useState<boolean>(false);
  const [pickerSelectedSubject, setPickerSelectedSubject] = useState<Subject | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>(
    learnerProfile?.name || learnerProfile?.["Full Name"] || currentUser?.displayName || "Learner"
  );
  const [editEmail, setEditEmail] = useState<string>(
    learnerProfile?.email || learnerProfile?.Email || currentUser?.email || ""
  );
  const [editSchool, setEditSchool] = useState<string>(
    learnerProfile?.school || "Green Valley High School"
  );
  const [editGrade, setEditGrade] = useState<string>(
    learnerProfile?.grade || learnerProfile?.Grade || `Grade ${selectedGrade || 7}`
  );
  const [editPhone, setEditPhone] = useState<string>(
    learnerProfile?.phone || learnerProfile?.["phone number"] || "+254 700 000 000"
  );
  const [editGender, setEditGender] = useState<string>(
    learnerProfile?.gender || "Female"
  );
  const [editLocation, setEditLocation] = useState<string>(
    learnerProfile?.location || learnerProfile?.Location || "Voi, Kenya"
  );

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showGoodbyeModal, setShowGoodbyeModal] = useState<boolean>(false);
  const [goodbyeStep, setGoodbyeStep] = useState<"rating" | "final">("rating");
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  // Sync profile edits when learnerProfile changes
  useEffect(() => {
    if (learnerProfile) {
      setEditFullName(learnerProfile.name || learnerProfile["Full Name"] || currentUser?.displayName || "Learner");
      setEditEmail(learnerProfile.email || learnerProfile.Email || currentUser?.email || "");
      setEditSchool(learnerProfile.school || "Green Valley High School");
      setEditGrade(learnerProfile.grade || learnerProfile.Grade || `Grade ${selectedGrade || 7}`);
      setEditPhone(learnerProfile.phone || learnerProfile["phone number"] || "+254 700 000 000");
      setEditGender(learnerProfile.gender || "Female");
      setEditLocation(learnerProfile.location || learnerProfile.Location || "Voi, Kenya");
    }
  }, [learnerProfile, currentUser, selectedGrade]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = learnerProfile?.name || learnerProfile?.["Full Name"] || currentUser?.displayName?.split(" ")[0] || "Learner";
  const userInitials = (displayName || "AN")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "AN";

  // Pre-configured metadata palette for subject cards
  const subjectStyles = [
    { color: "#1E88E5", defaultTopic: "Solving linear equations", finish: "you'll finish in about 2 days" },
    { color: "#5E35B1", defaultTopic: "Proving triangles congruent", finish: "you'll finish in about 4 days" },
    { color: "#F57C00", defaultTopic: "Simplifying fractions", finish: "you'll finish today" },
    { color: "#E53935", defaultTopic: "Cell structure", finish: "you'll finish in about 6 days" },
    { color: "#43A047", defaultTopic: "Balancing equations", finish: "you'll finish in about 3 days" },
    { color: "#00897B", defaultTopic: "Essay structure", finish: "you'll finish in about 2 days" },
    { color: "#FB8C00", defaultTopic: "Electric circuits", finish: "you'll finish in about 3 days" },
    { color: "#7CB342", defaultTopic: "Soil conservation", finish: "you'll finish in about 5 days" }
  ];

  // Map subjects to display list - Without circles / circle badges
  const displaySubjects = subjects.map((subj, idx) => {
    const style = subjectStyles[idx % subjectStyles.length];
    const totalTopics = subj.topics.length;
    const completedCount = subj.topics.filter(t => progress.completedTopics.includes(t.id)).length;
    const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : (idx === 0 ? 62 : idx === 1 ? 35 : idx === 2 ? 88 : idx === 3 ? 20 : idx === 4 ? 45 : 70);

    // Current topic in progress (first incomplete topic, or first topic)
    const currentTopic = subj.topics.find(t => !progress.completedTopics.includes(t.id)) || subj.topics[0];
    const topicTitle = currentTopic ? currentTopic.name : style.defaultTopic;

    return {
      originalSubject: subj,
      name: subj.name,
      topic: topicTitle,
      totalTopics,
      completedCount,
      pct,
      color: style.color,
      finish: style.finish,
      currentTopicId: currentTopic?.id || (subj.topics[0]?.id || "")
    };
  });

  const activeSubject = displaySubjects[selectedSubjectIndex] || displaySubjects[0];

  // Handle Continuing Active Topic
  const handleContinueTopic = () => {
    if (activeSubject) {
      onSelectTopic(activeSubject.originalSubject, activeSubject.currentTopicId);
    }
  };

  // Open Subject Picker Dialog for "Start Learn"
  const handleOpenStartLearn = () => {
    setPickerSelectedSubject(activeSubject ? activeSubject.originalSubject : subjects[0]);
    setShowSubjectPickerModal(true);
  };

  // Launch Learning for Chosen Subject
  const handleStartLearnSubject = (subject: Subject, topicId?: string) => {
    setShowSubjectPickerModal(false);
    const chosenTopicId = topicId || subject.topics.find(t => !progress.completedTopics.includes(t.id))?.id || subject.topics[0]?.id || "";
    onSelectTopic(subject, chosenTopicId);
  };

  // Save Profile Changes
  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        name: editFullName.trim(),
        "Full Name": editFullName.trim(),
        email: editEmail.trim(),
        Email: editEmail.trim(),
        school: editSchool.trim(),
        grade: editGrade,
        Grade: editGrade,
        gender: editGender,
        phone: editPhone.trim(),
        "phone number": editPhone.trim(),
        location: editLocation.trim(),
        Location: editLocation.trim()
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Account Deletion
  const handleConfirmDelete = async () => {
    setIsDeletingAccount(true);
    try {
      if (currentUser) {
        await deleteUserAccountFromFirestore(currentUser);
      }
      setGoodbyeStep("final");
    } catch (e) {
      console.warn("Delete account warning:", e);
      setGoodbyeStep("final");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Close goodbye modal and logout
  const handleCloseGoodbye = () => {
    setShowGoodbyeModal(false);
    onSignOut();
  };

  // History list items
  const historyItems = [
    { title: "Simplifying fractions", subject: "Mathematics", time: "Yesterday", score: "82%", status: "Passed" },
    { title: "Cell structure & function", subject: "Integrated Science", time: "2 days ago", score: "68%", status: "Completed" },
    { title: "Balancing simple equations", subject: "Science", time: "3 days ago", score: "91%", status: "Mastered" },
    { title: "Essay structure & paragraphs", subject: "English", time: "4 days ago", score: "75%", status: "Completed" }
  ];

  return (
    <div className="dashboard-root m2-app-surface" id="dashboard-app-container">
      <style>{`
        :root {
          --md-sys-color-primary: #1D2B4F;
          --md-sys-color-primary-container: #EEF3F8;
          --md-sys-color-on-primary: #FFFFFF;
          --md-sys-color-secondary: #FFD43B;
          --md-sys-color-on-secondary: #1D2B4F;
          --md-sys-color-surface: #FFFFFF;
          --md-sys-color-surface-variant: #F4F7FA;
          --md-sys-color-background: #EEF3F8;
          --md-sys-color-on-surface: #1D2B4F;
          --md-sys-color-on-surface-variant: #4B5875;
          --md-sys-color-outline: #D8E1EC;
          --md-sys-color-success: #2E7D32;
          --md-sys-color-error: #D32F2F;
          
          /* M2 Elevation Shadows */
          --md-elevation-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.16);
          --md-elevation-2: 0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12);
          --md-elevation-3: 0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10);
          --md-elevation-4: 0 14px 28px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.12);
          --md-elevation-5: 0 19px 38px rgba(0,0,0,0.22), 0 15px 12px rgba(0,0,0,0.15);
        }

        .dashboard-root {
          background: var(--md-sys-color-background);
          color: var(--md-sys-color-on-surface);
          font-family: 'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
          width: 100%;
        }

        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        /* M2 NAVIGATION DRAWER / SIDEBAR */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--md-sys-color-surface);
          border-right: 1px solid var(--md-sys-color-outline);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--md-elevation-1);
          z-index: 10;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 0 12px;
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--md-sys-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--md-sys-color-secondary);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          box-shadow: var(--md-elevation-1);
        }

        .brand-row span.name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 19px;
          letter-spacing: -0.02em;
          color: var(--md-sys-color-primary);
        }

        /* M2 Nav Item */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.01em;
          text-align: left;
          width: 100%;
          margin-bottom: 6px;
          transition: background .2s cubic-bezier(0.4, 0, 0.2, 1), color .2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(29, 43, 79, 0.05);
          color: var(--md-sys-color-primary);
        }

        .nav-item.active {
          background: var(--md-sys-color-primary);
          color: #ffffff;
          box-shadow: var(--md-elevation-1);
        }

        .nav-item .ic {
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
        }

        .sidebar-foot {
          margin-top: auto;
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant);
          padding: 12px;
          border-top: 1px solid var(--md-sys-color-outline);
          line-height: 1.5;
        }

        /* MAIN CONTENT AREA */
        .content {
          flex: 1;
          padding: 32px 40px;
          max-width: 1100px;
          width: 100%;
        }

        .view-panel {
          animation: fadeIn 0.25s cubic-bezier(0, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* GREETING */
        .greet-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .greet-row h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 26px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .greet-row p {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
          margin-top: 4px;
        }

        .chips {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        /* M2 Material Chip */
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 16px;
          border: 1px solid var(--md-sys-color-outline);
          background: var(--md-sys-color-surface);
          box-shadow: var(--md-elevation-1);
        }

        .chip.grade {
          color: #5E35B1;
          border-color: #D1C4E9;
          background: #EDE7F6;
        }

        .chip.streak {
          color: #E65100;
          border-color: #FFE082;
          background: #FFF8E1;
        }

        /* M2 TODAY ELEVATED CARD */
        .today-card {
          background: var(--md-sys-color-primary);
          border-radius: 16px;
          padding: 28px 32px;
          color: #ffffff;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
          box-shadow: var(--md-elevation-3);
        }

        .today-info {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 260px;
        }

        .today-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--md-sys-color-secondary);
          margin-bottom: 6px;
        }

        .today-info h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          margin-bottom: 4px;
          color: #ffffff;
          font-weight: 700;
        }

        .today-info .subj-name {
          color: #CFD8DC;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 18px;
        }

        /* M2 Linear Progress Indicator */
        .progress-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }

        .progress-track {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.22);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4CAF50;
          border-radius: 4px;
          transition: width .4s ease;
        }

        .progress-pct {
          font-weight: 700;
          font-size: 14px;
          color: var(--md-sys-color-secondary);
          min-width: 40px;
          text-align: right;
        }

        .finish-est {
          font-size: 13px;
          color: #B0BEC5;
        }

        /* Today Card Actions Row (Continue + Start Learn) */
        .today-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        /* M2 Contained Primary Accent Button */
        .btn-m2-primary {
          background: var(--md-sys-color-secondary);
          color: var(--md-sys-color-primary);
          border: none;
          border-radius: 8px;
          padding: 12px 22px;
          font-weight: 700;
          font-size: 13.5px;
          letter-spacing: 0.02em;
          box-shadow: var(--md-elevation-2);
          transition: transform .15s, box-shadow .15s, background .15s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-m2-primary:hover {
          box-shadow: var(--md-elevation-3);
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .btn-m2-primary:active {
          transform: translateY(0);
          box-shadow: var(--md-elevation-1);
        }

        /* M2 Contained Secondary Button: Start Learn */
        .btn-m2-start-learn {
          background: #FFFFFF;
          color: var(--md-sys-color-primary);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 8px;
          padding: 12px 22px;
          font-weight: 700;
          font-size: 13.5px;
          letter-spacing: 0.02em;
          box-shadow: var(--md-elevation-2);
          transition: transform .15s, box-shadow .15s, background .15s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-m2-start-learn:hover {
          background: #F0F4F8;
          box-shadow: var(--md-elevation-3);
          transform: translateY(-1px);
        }

        .btn-m2-start-learn:active {
          transform: translateY(0);
          box-shadow: var(--md-elevation-1);
        }

        /* SECTION TITLES */
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--md-sys-color-primary);
          font-weight: 700;
        }

        .section-title span.sub {
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        /* M2 SUBJECT CARDS (NO CIRCLE / ICON BADGES) */
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 34px;
        }

        .subject-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: transform .2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .2s cubic-bezier(0.4, 0, 0.2, 1), border-color .2s;
          text-align: left;
          box-shadow: var(--md-elevation-1);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .subject-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--md-elevation-2);
          border-color: #B0BEC5;
        }

        .subject-card.selected {
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 2px var(--md-sys-color-primary), var(--md-elevation-2);
        }

        /* Clean header without any circle badge */
        .subject-card-header {
          margin-bottom: 8px;
        }

        .subject-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
          margin-bottom: 4px;
        }

        .subject-card .topic {
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 14px;
          min-height: 38px;
          line-height: 1.4;
        }

        .mini-track {
          height: 6px;
          border-radius: 3px;
          background: var(--md-sys-color-background);
          overflow: hidden;
          margin-bottom: 8px;
        }

        .mini-fill {
          height: 100%;
          border-radius: 3px;
          transition: width .3s ease;
        }

        .subject-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant);
          font-weight: 500;
        }

        /* M2 HISTORY LIST */
        .history-list {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--md-elevation-1);
        }

        .history-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--md-sys-color-outline);
          gap: 16px;
          flex-wrap: wrap;
          transition: background .15s;
        }

        .history-row:hover {
          background: #F8FAFC;
        }

        .history-row:last-child {
          border-bottom: none;
        }

        .history-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .history-left h4 {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--md-sys-color-primary);
        }

        .history-left p {
          font-size: 12.5px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .history-score-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E8F5E9;
          color: #2E7D32;
          font-weight: 700;
          font-size: 13px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #C8E6C9;
        }

        /* M2 PROFILE VIEW */
        .profile-header {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 16px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          box-shadow: var(--md-elevation-1);
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 24px;
          box-shadow: var(--md-elevation-1);
          flex-shrink: 0;
        }

        .profile-meta h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          margin-bottom: 4px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
        }

        .profile-meta p {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .profile-tags {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: var(--md-elevation-1);
        }

        .stat-card .num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--md-sys-color-primary);
        }

        .stat-card .lbl {
          font-size: 12.5px;
          color: var(--md-sys-color-on-surface-variant);
          margin-top: 4px;
          font-weight: 500;
        }

        .sub-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: var(--md-elevation-1);
        }

        .sub-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          margin-bottom: 4px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
        }

        .sub-card p {
          font-size: 13.5px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E8F5E9;
          color: #2E7D32;
          font-weight: 700;
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid #C8E6C9;
        }

        .detail-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--md-elevation-1);
        }

        .detail-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .detail-head h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--md-sys-color-outline);
          color: var(--md-sys-color-primary);
          border-radius: 8px;
          padding: 9px 16px;
          font-weight: 600;
          font-size: 13.5px;
          transition: background .15s, border-color .15s;
          cursor: pointer;
        }

        .btn-outline:hover {
          background: #F4F7FA;
          border-color: #90A4AE;
        }

        .edit-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--md-sys-color-outline);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface-variant);
        }

        .field input, .field select {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline);
          font-size: 14px;
          color: var(--md-sys-color-primary);
          outline: none;
          background: #FFFFFF;
          transition: border-color .2s, box-shadow .2s;
        }

        .field input:focus, .field select:focus {
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 3px rgba(29, 43, 79, 0.12);
        }

        .save-row {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .btn-primary {
          background: var(--md-sys-color-primary);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: var(--md-elevation-1);
        }

        .btn-primary:hover {
          box-shadow: var(--md-elevation-2);
        }

        .danger-card {
          background: #FFEBEE;
          border: 1px solid #FFCDD2;
          border-radius: 14px;
          padding: 24px;
        }

        .danger-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          color: #C62828;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .danger-card p {
          font-size: 13.5px;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 16px;
        }

        .btn-danger {
          background: var(--md-sys-color-error);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: var(--md-elevation-1);
        }

        .btn-danger:hover {
          box-shadow: var(--md-elevation-2);
          background: #B71C1C;
        }

        /* M2 MODALS (24dp Elevation) */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(29, 43, 79, 0.45);
          backdrop-filter: blur(2px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn .2s cubic-bezier(0, 0, 0.2, 1);
        }

        .modal-box {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          box-shadow: var(--md-elevation-5);
        }

        .modal-box.wide {
          max-width: 620px;
        }

        .modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--md-sys-color-outline);
        }

        .modal-head h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          color: var(--md-sys-color-primary);
          font-weight: 700;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          font-size: 20px;
          color: var(--md-sys-color-on-surface-variant);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .btn-close-modal:hover {
          background: #ECEFF1;
        }

        /* Subject Picker Modal List */
        .picker-subjects-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 4px;
        }

        .picker-subject-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border: 1.5px solid var(--md-sys-color-outline);
          border-radius: 10px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all .2s;
        }

        .picker-subject-item:hover {
          border-color: var(--md-sys-color-primary);
          background: #F8FAFC;
          transform: translateX(2px);
        }

        .picker-subject-item.active {
          border-color: var(--md-sys-color-primary);
          background: #EEF3F8;
          box-shadow: var(--md-elevation-1);
        }

        .picker-subject-info h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--md-sys-color-primary);
          margin-bottom: 2px;
        }

        .picker-subject-info p {
          font-size: 12.5px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .btn-picker-select {
          background: var(--md-sys-color-primary);
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .stars {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 18px;
        }

        .stars button {
          background: none;
          border: none;
          font-size: 32px;
          color: #CFD8DC;
          transition: color .15s, transform .1s;
          cursor: pointer;
        }

        .stars button.filled {
          color: var(--md-sys-color-secondary);
        }

        .modal-box textarea {
          width: 100%;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          padding: 12px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          height: 80px;
          margin-bottom: 18px;
          outline: none;
          color: var(--md-sys-color-primary);
        }

        .modal-box textarea:focus {
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 3px rgba(29, 43, 79, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 72px;
            padding: 20px 8px;
          }
          .brand-row .name, .nav-item span:not(.ic), .sidebar-foot {
            display: none;
          }
          .brand-row {
            justify-content: center;
            padding: 0;
          }
          .nav-item {
            justify-content: center;
            padding: 12px 0;
          }
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .content {
            padding: 20px 16px;
          }
          .subjects-grid {
            grid-template-columns: 1fr;
          }
          .edit-form {
            grid-template-columns: 1fr;
          }
          .stats-row {
            grid-template-columns: 1fr;
          }
          .today-card {
            padding: 20px;
          }
          .today-actions-row {
            width: 100%;
          }
          .btn-m2-primary, .btn-m2-start-learn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        {/* M2 SIDEBAR DRAWER */}
        <aside className="sidebar" id="dashboard-sidebar">
          <div className="brand-row">
            <span className="logo-mark">L</span>
            <span className="name">Learn Adm</span>
          </div>

          <button
            type="button"
            className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
            id="nav-dashboard-btn"
          >
            <span className="ic">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeView === "profile" ? "active" : ""}`}
            onClick={() => setActiveView("profile")}
            id="nav-profile-btn"
          >
            <span className="ic">☺</span>
            <span>Profile</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={onSignOut}
            id="nav-signout-btn"
            style={{ marginTop: "12px", color: "var(--md-sys-color-error)" }}
          >
            <span className="ic">⇥</span>
            <span>Sign out</span>
          </button>

          <p className="sidebar-foot" id="sidebar-grade-school">
            {editGrade || `Grade ${selectedGrade}`} · {editSchool || "Green Valley High"}
          </p>
        </aside>

        {/* MAIN CONTENT STAGE */}
        <main className="content">
          
          {/* ============================================================ */}
          {/* VIEW 1: DASHBOARD                                            */}
          {/* ============================================================ */}
          {activeView === "dashboard" && (
            <div className="view-panel" id="viewDashboard">
              
              {/* GREETING HEADER */}
              <div className="greet-row">
                <div>
                  <h1 id="greetText">{greetWord}, {displayName}</h1>
                  <p>Ready to keep your streak going?</p>
                </div>
                <div className="chips">
                  <span className="chip grade">{editGrade || `Grade ${selectedGrade}`}</span>
                  <span className="chip streak">🔥 {progress.streak || 14}-day streak</span>
                </div>
              </div>

              {/* TODAY FOCUS CARD */}
              <div className="today-card" id="todayCard">
                <div className="today-info">
                  <span className="today-label">Today</span>
                  <div className="subj-name" id="todaySubject">{activeSubject?.name || "Algebra"}</div>
                  <h2 id="todayTopic">{activeSubject?.topic || "Solving linear equations"}</h2>
                  <div className="progress-row">
                    <div className="progress-track">
                      <div className="progress-fill" id="todayFill" style={{ width: `${activeSubject?.pct || 62}%` }}></div>
                    </div>
                    <span className="progress-pct" id="todayPct">{activeSubject?.pct || 62}%</span>
                  </div>
                  <p className="finish-est" id="todayFinish">
                    At your current pace, {activeSubject?.finish || "you'll finish in about 2 days"}
                  </p>
                </div>

                {/* ACTION BUTTONS: CONTINUE TOPIC & START LEARN */}
                <div className="today-actions-row">
                  <button
                    type="button"
                    className="btn-m2-primary"
                    onClick={handleContinueTopic}
                    id="today-continue-topic-btn"
                  >
                    Continue topic →
                  </button>

                  <button
                    type="button"
                    className="btn-m2-start-learn"
                    onClick={handleOpenStartLearn}
                    id="today-start-learn-btn"
                  >
                    Start Learn
                  </button>
                </div>
              </div>

              {/* SUBJECTS SECTION (CLEAN SUBJECTS WITHOUT ANY CIRCLE ICONS) */}
              <div className="section-title">
                Your subjects <span className="sub">Select a subject to make it today's focus</span>
              </div>
              
              <div className="subjects-grid" id="subjectsGrid">
                {displaySubjects.map((s, i) => (
                  <div
                    key={s.name + i}
                    className={`subject-card ${i === selectedSubjectIndex ? "selected" : ""}`}
                    onClick={() => setSelectedSubjectIndex(i)}
                    id={`subject-card-${i}`}
                  >
                    <div className="subject-card-header">
                      <h3>{s.name}</h3>
                    </div>
                    <div className="topic">{s.topic}</div>
                    <div>
                      <div className="mini-track">
                        <div className="mini-fill" style={{ width: `${s.pct}%`, background: s.color }}></div>
                      </div>
                      <div className="subject-card-footer">
                        <span>{s.pct}% complete</span>
                        <span>{s.totalTopics} topics</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LEARNING HISTORY */}
              <div className="section-title">History</div>
              <div className="history-list" id="historyList">
                {historyItems.map((h, idx) => (
                  <div className="history-row" key={idx}>
                    <div className="history-left">
                      <h4>{h.title}</h4>
                      <p>{h.subject} · {h.time}</p>
                    </div>
                    <span className="history-score-badge">
                      ✓ {h.score} ({h.status})
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: PROFILE                                              */}
          {/* ============================================================ */}
          {activeView === "profile" && (
            <div className="view-panel" id="viewProfile">
              
              {/* PROFILE HEADER */}
              <div className="profile-header">
                <div className="avatar">{userInitials}</div>
                <div className="profile-meta">
                  <h2>{editFullName || displayName}</h2>
                  <p>{editSchool} · {editLocation}</p>
                  <div className="profile-tags">
                    <span className="chip grade">{editGrade}</span>
                    <span className="chip streak">🔥 {progress.streak || 14}-day streak</span>
                  </div>
                </div>
              </div>

              {/* STATS ROW */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="num">{progress.streak || 14}</div>
                  <div className="lbl">Day streak</div>
                </div>
                <div className="stat-card">
                  <div className="num">{progress.completedTopics.length || 27}</div>
                  <div className="lbl">Topics completed</div>
                </div>
                <div className="stat-card">
                  <div className="num">{subjects.length || 6}</div>
                  <div className="lbl">Subjects in progress</div>
                </div>
              </div>

              {/* SUBSCRIPTION CARD */}
              <div className="sub-card">
                <div>
                  <div className="plan-badge">✓ ACTIVE</div>
                  <h3>Learn Adm Pro</h3>
                  <p>Renews on 12 September 2026 · KES 500/month</p>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => alert("Learn Adm Pro is currently active for your account.")}
                >
                  Manage subscription
                </button>
              </div>

              {/* PROFILE DETAILS & EDIT FORM */}
              <div className="detail-card">
                <div className="detail-head">
                  <h3>Profile details</h3>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    id="toggle-edit-profile-btn"
                  >
                    {isEditingProfile ? "Hide details" : "More details"}
                  </button>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--md-sys-color-on-surface-variant)", marginTop: "6px" }}>
                  Full name, school, grade, and contact details.
                </p>

                {isEditingProfile && (
                  <form className="edit-form" onSubmit={handleSaveProfileChanges} id="editForm">
                    <div className="field">
                      <label>Full name</label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>School</label>
                      <input
                        type="text"
                        value={editSchool}
                        onChange={(e) => setEditSchool(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Current grade</label>
                      <select
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        required
                      >
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Phone number</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Gender</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        required
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label>Location</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="save-row">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* DANGER ZONE: DELETE ACCOUNT */}
              <div className="danger-card">
                <h3>Delete account</h3>
                <p>This permanently removes your history, streak, and subscription. This can't be undone.</p>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                  id="open-delete-account-modal"
                >
                  Delete my account
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ============================================================ */}
      {/* START LEARN - CHOOSE SUBJECT MODAL (M2 24dp Elevation)       */}
      {/* ============================================================ */}
      {showSubjectPickerModal && (
        <div className="modal-overlay" id="subjectPickerModal">
          <div className="modal-box wide">
            <div className="modal-head">
              <h2>Choose a Subject to Learn</h2>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowSubjectPickerModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)", marginBottom: "16px" }}>
              Select any subject to begin an active learning session immediately:
            </p>

            <div className="picker-subjects-list" id="pickerSubjectsList">
              {subjects.map((subj, idx) => {
                const totalTopics = subj.topics.length;
                const completedCount = subj.topics.filter(t => progress.completedTopics.includes(t.id)).length;
                const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
                const isCurrentActive = pickerSelectedSubject?.id === subj.id;

                return (
                  <div
                    key={subj.id || subj.name + idx}
                    className={`picker-subject-item ${isCurrentActive ? "active" : ""}`}
                    onClick={() => setPickerSelectedSubject(subj)}
                  >
                    <div className="picker-subject-info">
                      <h4>{subj.name}</h4>
                      <p>
                        {subj.topics[0]?.name ? `Topic: ${subj.topics[0].name}` : `${totalTopics} topics available`} · {pct}% completed
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-picker-select"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLearnSubject(subj);
                      }}
                    >
                      Start Learning →
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowSubjectPickerModal(false)}
              >
                Cancel
              </button>
              {pickerSelectedSubject && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleStartLearnSubject(pickerSelectedSubject)}
                >
                  Learn {pickerSelectedSubject.name}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================ */}
      {showDeleteModal && (
        <div className="modal-overlay" id="deleteModal">
          <div className="modal-box">
            <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--md-sys-color-primary)", fontWeight: 700 }}>
              Delete your account?
            </h2>
            <p style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)", marginBottom: "20px", lineHeight: "1.5" }}>
              This will permanently remove your history, streak, and subscription. This can't be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowGoodbyeModal(true);
                  setGoodbyeStep("rating");
                }}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* GOODBYE / RATING MODAL                                       */}
      {/* ============================================================ */}
      {showGoodbyeModal && (
        <div className="modal-overlay" id="goodbyeModal">
          <div className="modal-box">
            {goodbyeStep === "rating" ? (
              <div id="stepRating">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--md-sys-color-primary)", fontWeight: 700 }}>
                  We're sorry to see you go
                </h2>
                <p style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)", marginBottom: "16px", lineHeight: "1.5" }}>
                  Before you leave, could you rate your experience with Learn Adm? It helps us make it better for the next learner.
                </p>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={v <= ratingValue ? "filled" : ""}
                      onClick={() => setRatingValue(v)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Tell us why (optional)"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ width: "100%" }}
                    onClick={handleConfirmDelete}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "Deleting account..." : "Submit and delete account"}
                  </button>
                </div>
              </div>
            ) : (
              <div id="stepFinal">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--md-sys-color-primary)", fontWeight: 700 }}>
                  Your account has been deleted
                </h2>
                <p style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)", marginBottom: "20px", lineHeight: "1.5" }}>
                  Thanks for learning with Learn Adm — we hope to see you back one day.
                </p>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ width: "100%" }}
                  onClick={handleCloseGoodbye}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
