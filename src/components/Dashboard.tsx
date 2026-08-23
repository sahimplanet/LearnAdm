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

  // Filter or adapt subjects for display
  // Pre-configured metadata palette for subject cards
  const subjectStyles = [
    { color: "#2F9E44", bg: "#E4F5E8", icon: "∑", defaultTopic: "Solving linear equations", finish: "you'll finish in about 2 days" },
    { color: "#6C4FD9", bg: "#E9E4FF", icon: "△", defaultTopic: "Proving triangles congruent", finish: "you'll finish in about 4 days" },
    { color: "#B8860B", bg: "#FFF6DC", icon: "½", defaultTopic: "Simplifying fractions", finish: "you'll finish today" },
    { color: "#D9534F", bg: "#FFE8E8", icon: "⌬", defaultTopic: "Cell structure", finish: "you'll finish in about 6 days" },
    { color: "#2F9E44", bg: "#E4F5E8", icon: "⚗", defaultTopic: "Balancing equations", finish: "you'll finish in about 3 days" },
    { color: "#6C4FD9", bg: "#E9E4FF", icon: "✎", defaultTopic: "Essay structure", finish: "you'll finish in about 2 days" },
    { color: "#B8860B", bg: "#FFF6DC", icon: "⚡", defaultTopic: "Electric circuits", finish: "you'll finish in about 3 days" },
    { color: "#2F9E44", bg: "#E4F5E8", icon: "🌱", defaultTopic: "Soil conservation", finish: "you'll finish in about 5 days" }
  ];

  // Map subjects to display list
  const displaySubjects = subjects.slice(0, 6).map((subj, idx) => {
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
      pct,
      color: style.color,
      bg: style.bg,
      icon: style.icon,
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
    { title: "Simplifying fractions", subject: "Algebra", time: "Yesterday", score: "82%", dotColor: "#2F9E44" },
    { title: "Cell structure", subject: "Biology", time: "2 days ago", score: "68%", dotColor: "#6C4FD9" },
    { title: "Balancing equations", subject: "Chemistry", time: "3 days ago", score: "91%", dotColor: "#B8860B" },
    { title: "Essay structure", subject: "English", time: "4 days ago", score: "75%", dotColor: "#FF6B6B" }
  ];

  return (
    <div className="dashboard-root" id="dashboard-app-container">
      <style>{`
        :root {
          --bg: #EEF3F8;
          --grid-line: rgba(29,43,79,0.07);
          --ink: #1D2B4F;
          --ink-soft: #4B5875;
          --ink-faint: #8291A8;
          --green: #2F9E44;
          --green-soft: #E4F5E8;
          --yellow: #FFD43B;
          --yellow-soft: #FFF6DC;
          --coral: #FF6B6B;
          --coral-soft: #FFE8E8;
          --purple-soft: #E9E4FF;
          --purple: #6C4FD9;
          --card: #FFFFFF;
          --card-border: #D8E1EC;
          --radius: 14px;
        }

        .dashboard-root {
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 28px 28px;
          min-height: 100vh;
          width: 100%;
        }

        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        /* SIDEBAR */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--card);
          border-right: 1.5px solid var(--card-border);
          padding: 26px 18px;
          display: flex;
          flex-direction: column;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 34px;
          padding: 0 6px;
        }

        .logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--yellow);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 15px;
          user-select: none;
        }

        .brand-row span.name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--ink);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--ink-soft);
          font-weight: 600;
          font-size: 14.5px;
          text-align: left;
          width: 100%;
          margin-bottom: 4px;
          transition: background .15s, color .15s;
          cursor: pointer;
        }

        .nav-item .ic {
          width: 20px;
          text-align: center;
          font-size: 16px;
        }

        .nav-item:hover {
          background: var(--bg);
          color: var(--ink);
        }

        .nav-item.active {
          background: var(--ink);
          color: #fff;
        }

        .sidebar-foot {
          margin-top: auto;
          font-size: 11.5px;
          color: var(--ink-faint);
          padding: 0 6px;
          line-height: 1.4;
        }

        /* CONTENT */
        .content {
          flex: 1;
          padding: 36px 40px;
          max-width: 1040px;
          width: 100%;
        }

        .view-panel {
          animation: fadeIn .3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* GREETING */
        .greet-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 26px;
          flex-wrap: wrap;
          gap: 14px;
        }

        .greet-row h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 27px;
          color: var(--ink);
          font-weight: 700;
        }

        .greet-row p {
          font-size: 14px;
          color: var(--ink-soft);
          margin-top: 4px;
        }

        .chips {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 13px;
          border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--card);
        }

        .chip.grade {
          color: var(--purple);
          border-color: #dcd4fb;
          background: var(--purple-soft);
        }

        .chip.streak {
          color: #B8860B;
          border-color: #f6e6ae;
          background: var(--yellow-soft);
        }

        /* TODAY CARD */
        .today-card {
          background: var(--ink);
          border-radius: 18px;
          padding: 28px 30px;
          color: #fff;
          margin-bottom: 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .today-card::before {
          content: "";
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          background: var(--yellow);
          opacity: .12;
          border-radius: 50%;
        }

        .today-info {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 240px;
        }

        .today-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--yellow);
          margin-bottom: 8px;
        }

        .today-info h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          margin-bottom: 6px;
          color: #fff;
        }

        .today-info .subj-name {
          color: #B9C4D6;
          font-size: 13.5px;
          margin-bottom: 16px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .progress-track {
          flex: 1;
          height: 8px;
          border-radius: 99px;
          background: rgba(255,255,255,0.15);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--green);
          border-radius: 99px;
          transition: width .4s ease;
        }

        .progress-pct {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          color: var(--yellow);
          min-width: 38px;
          text-align: right;
        }

        .finish-est {
          font-size: 12.5px;
          color: #B9C4D6;
        }

        .btn-continue {
          background: var(--yellow);
          color: var(--ink);
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-weight: 700;
          font-size: 14px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: transform .15s, box-shadow .15s;
          cursor: pointer;
        }

        .btn-continue:hover {
          box-shadow: 0 8px 20px rgba(255,212,59,0.3);
        }

        .btn-continue:active {
          transform: translateY(1px);
        }

        /* SUBJECTS */
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--ink);
          font-weight: 700;
        }

        .section-title span.sub {
          font-size: 12.5px;
          color: var(--ink-faint);
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 32px;
        }

        .subject-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          text-align: left;
        }

        .subject-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(29,43,79,0.08);
        }

        .subject-card.selected {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .subj-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 12px;
          user-select: none;
        }

        .subject-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14.5px;
          margin-bottom: 4px;
          color: var(--ink);
          font-weight: 700;
        }

        /* Displays topic title cleanly without paragraph descriptions */
        .subject-card .topic {
          font-size: 12px;
          color: var(--ink-soft);
          margin-bottom: 12px;
          min-height: 30px;
          line-height: 1.35;
        }

        .mini-track {
          height: 6px;
          border-radius: 99px;
          background: var(--bg);
          overflow: hidden;
          margin-bottom: 6px;
        }

        .mini-fill {
          height: 100%;
          border-radius: 99px;
        }

        .subject-card .pct-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--ink-faint);
        }

        /* HISTORY */
        .history-list {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 14px;
          overflow: hidden;
        }

        .history-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          border-bottom: 1px solid var(--card-border);
          gap: 14px;
          flex-wrap: wrap;
        }

        .history-row:last-child {
          border-bottom: none;
        }

        .history-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .history-left h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }

        .history-left p {
          font-size: 12px;
          color: var(--ink-faint);
          margin-top: 2px;
        }

        .history-score {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--green);
        }

        /* PROFILE VIEW */
        .profile-header {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 16px;
          padding: 26px;
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--yellow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 24px;
          flex-shrink: 0;
        }

        .profile-meta h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          margin-bottom: 4px;
          color: var(--ink);
        }

        .profile-meta p {
          font-size: 13px;
          color: var(--ink-soft);
        }

        .profile-tags {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 14px;
          padding: 16px 18px;
        }

        .stat-card .num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
        }

        .stat-card .lbl {
          font-size: 12px;
          color: var(--ink-soft);
          margin-top: 2px;
        }

        .sub-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .sub-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          margin-bottom: 4px;
          color: var(--ink);
        }

        .sub-card p {
          font-size: 13px;
          color: var(--ink-soft);
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--green-soft);
          color: var(--green);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 99px;
          margin-bottom: 8px;
        }

        .detail-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 20px;
        }

        .detail-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .detail-head h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          color: var(--ink);
        }

        .btn-outline {
          background: transparent;
          border: 1.5px solid var(--card-border);
          color: var(--ink);
          border-radius: 9px;
          padding: 9px 16px;
          font-weight: 600;
          font-size: 13.5px;
          transition: border-color .2s;
          cursor: pointer;
        }

        .btn-outline:hover {
          border-color: var(--ink-faint);
        }

        .edit-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--card-border);
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
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
        }

        .field input, .field select {
          padding: 10px 12px;
          border-radius: 9px;
          border: 1.5px solid var(--card-border);
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          outline: none;
          background: #fff;
          transition: border-color .2s, box-shadow .2s;
        }

        .field input:focus, .field select:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .save-row {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .btn-primary {
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }

        .danger-card {
          background: var(--coral-soft);
          border: 1.5px solid #ffd2d2;
          border-radius: 16px;
          padding: 22px 24px;
        }

        .danger-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          color: #B8433B;
          margin-bottom: 6px;
        }

        .danger-card p {
          font-size: 13px;
          color: var(--ink-soft);
          margin-bottom: 14px;
        }

        .btn-danger {
          background: var(--coral);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 18px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }

        /* MODALS */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(29,43,79,0.45);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn .2s ease;
        }

        .modal-box {
          background: #fff;
          border-radius: 18px;
          padding: 30px 28px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(29,43,79,0.25);
          text-align: center;
        }

        .modal-icon {
          font-size: 30px;
          margin-bottom: 12px;
        }

        .modal-box h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 19px;
          margin-bottom: 8px;
          color: var(--ink);
        }

        .modal-box p {
          font-size: 13.5px;
          color: var(--ink-soft);
          margin-bottom: 22px;
          line-height: 1.55;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
        }

        .modal-actions button {
          flex: 1;
          padding: 11px 0;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
        }

        .modal-actions .btn-cancel {
          background: var(--bg);
          color: var(--ink);
          border: 1.5px solid var(--card-border);
        }

        .modal-actions .btn-confirm-danger {
          background: var(--coral);
          color: #fff;
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
          font-size: 30px;
          color: var(--card-border);
          transition: color .15s, transform .1s;
          cursor: pointer;
        }

        .stars button:hover {
          transform: scale(1.1);
        }

        .stars button.filled {
          color: var(--yellow);
        }

        .modal-box textarea {
          width: 100%;
          border: 1.5px solid var(--card-border);
          border-radius: 10px;
          padding: 11px 13px;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          resize: none;
          height: 70px;
          margin-bottom: 18px;
          outline: none;
          color: var(--ink);
        }

        .modal-box textarea:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .btn-submit-feedback {
          width: 100%;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 0;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 76px;
            padding: 20px 10px;
          }
          .brand-row .name, .nav-item span:not(.ic), .sidebar-foot {
            display: none;
          }
          .brand-row {
            justify-content: center;
          }
          .nav-item {
            justify-content: center;
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
            padding: 22px 16px;
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
        }
      `}</style>

      <div className="dashboard-layout">
        {/* SIDEBAR */}
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
            style={{ marginTop: "12px", color: "var(--coral)" }}
          >
            <span className="ic">⇥</span>
            <span>Sign out</span>
          </button>

          <p className="sidebar-foot" id="sidebar-grade-school">
            {editGrade || `Grade ${selectedGrade}`} · {editSchool || "Green Valley High"}
          </p>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content">
          
          {/* ============================================================ */}
          {/* VIEW 1: DASHBOARD                                            */}
          {/* ============================================================ */}
          {activeView === "dashboard" && (
            <div className="view-panel" id="viewDashboard">
              
              {/* GREETING ROW */}
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

              {/* TODAY CARD */}
              <div className="today-card" id="todayCard">
                <div className="today-info">
                  <div className="today-label">Today</div>
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
                <button
                  type="button"
                  className="btn-continue"
                  onClick={handleContinueTopic}
                  id="today-continue-topic-btn"
                >
                  Continue topic →
                </button>
              </div>

              {/* SUBJECTS SECTION (WITHOUT DESCRIPTION - USES TOPIC NAMES) */}
              <div className="section-title">
                Your subjects <span className="sub">Tap a subject to make it today's focus</span>
              </div>
              
              <div className="subjects-grid" id="subjectsGrid">
                {displaySubjects.map((s, i) => (
                  <div
                    key={s.name + i}
                    className={`subject-card ${i === selectedSubjectIndex ? "selected" : ""}`}
                    onClick={() => setSelectedSubjectIndex(i)}
                    id={`subject-card-${i}`}
                  >
                    <div className="subj-icon" style={{ background: s.bg, color: s.color }}>
                      {s.icon}
                    </div>
                    <h3>{s.name}</h3>
                    {/* Clean topic line without verbose descriptions */}
                    <div className="topic">{s.topic}</div>
                    <div className="mini-track">
                      <div className="mini-fill" style={{ width: `${s.pct}%`, background: s.color }}></div>
                    </div>
                    <div className="pct-label">{s.pct}% complete</div>
                  </div>
                ))}
              </div>

              {/* HISTORY SECTION */}
              <div className="section-title">History</div>
              <div className="history-list" id="historyList">
                {historyItems.map((h, idx) => (
                  <div className="history-row" key={idx}>
                    <div className="history-left">
                      <span className="history-dot" style={{ background: h.dotColor }}></span>
                      <div>
                        <h4>{h.title}</h4>
                        <p>{h.subject} · {h.time}</p>
                      </div>
                    </div>
                    <span className="history-score">{h.score}</span>
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
                <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "6px" }}>
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
      {/* DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================ */}
      {showDeleteModal && (
        <div className="modal-overlay" id="deleteModal">
          <div className="modal-box">
            <div className="modal-icon">⚠️</div>
            <h2>Delete your account?</h2>
            <p>This will permanently remove your history, streak, and subscription. This can't be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-danger"
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
                <div className="modal-icon">💔</div>
                <h2>We're sorry to see you go</h2>
                <p>
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
                <button
                  type="button"
                  className="btn-submit-feedback"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting account..." : "Submit and delete account"}
                </button>
              </div>
            ) : (
              <div id="stepFinal">
                <div className="modal-icon">👋</div>
                <h2>Your account has been deleted</h2>
                <p>Thanks for learning with Learn Adm — we hope to see you back one day.</p>
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
