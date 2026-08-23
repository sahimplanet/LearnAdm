import React, { useState } from "react";
import { updateUserProfileInFirestore, deleteUserAccountFromFirestore } from "../lib/userService";
import { NextReadLogo } from "./NextReadLogo";
import { PhoneInputWithCountry } from "./PhoneInputWithCountry";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  School,
  Image as ImageIcon,
  Camera,
  Upload,
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Edit3,
  Trash2,
  X,
  ShieldAlert,
  Save,
  Send
} from "lucide-react";

interface LearnerProfileData {
  name: string;
  "Full Name"?: string;
  email: string;
  Email?: string;
  photoFileName: string;
  "photo file name"?: string;
  location: string;
  Location?: string;
  grade: string;
  Grade?: string;
  phone: string;
  "phone number"?: string;
  school: string;
  Age: string;
  chosedSubject: string;
  "chosed subject"?: string;
  [key: string]: any;
}

interface LearnerOnboardingProps {
  user: any;
  initialData?: Partial<LearnerProfileData> | null;
  onComplete: (profile: LearnerProfileData) => void;
  onClose?: () => void;
  onAccountDeleted?: () => void;
  isModalMode?: boolean;
}

export const LearnerOnboarding: React.FC<LearnerOnboardingProps> = ({
  user,
  initialData,
  onComplete,
  onClose,
  onAccountDeleted,
  isModalMode = false
}) => {
  // Mode state: 'view' (profile cards) vs 'edit' (form) vs 'delete' (confirmation)
  const [mode, setMode] = useState<"view" | "edit" | "delete">(
    initialData && initialData.name ? "view" : "edit"
  );

  // Form field state - starts empty for new signups so user must enter details themselves
  const [name, setName] = useState(
    initialData?.name || initialData?.["Full Name"] || user?.displayName || ""
  );
  const [email, setEmail] = useState(
    initialData?.email || initialData?.Email || user?.email || ""
  );
  const [photoFileName, setPhotoFileName] = useState(
    initialData?.photoFileName || initialData?.["photo file name"] || "avatar_student.png"
  );
  const [location, setLocation] = useState(
    initialData?.location || initialData?.Location || ""
  );
  const [grade, setGrade] = useState(
    initialData?.grade || initialData?.Grade || ""
  );
  const [phone, setPhone] = useState(
    initialData?.phone || initialData?.["phone number"] || ""
  );
  const [school, setSchool] = useState(
    initialData?.school || ""
  );
  const [age, setAge] = useState(
    initialData?.Age || ""
  );
  const [chosedSubject, setChosedSubject] = useState(
    initialData?.chosedSubject || initialData?.["chosed subject"] || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle image upload from file picker
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Please select an image smaller than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setPhotoFileName(result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFileName("avatar_student.png");
  };

  // Save profile edits to Firestore /users/{{uid}}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate all mandatory questions
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!grade.trim()) {
      setError("Please enter your grade / class.");
      return;
    }
    if (!school.trim()) {
      setError("Please enter your school name.");
      return;
    }
    if (!age.trim()) {
      setError("Please enter your age.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }
    if (!chosedSubject.trim()) {
      setError("Please enter your chosen subject.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        "Full Name": name.trim(),
        email: email.trim(),
        Email: email.trim(),
        photoFileName: photoFileName.trim() || "avatar_default.png",
        "photo file name": photoFileName.trim() || "avatar_default.png",
        location: location.trim(),
        Location: location.trim(),
        grade: grade.trim(),
        Grade: grade.trim(),
        phone: phone.trim(),
        "phone number": phone.trim(),
        school: school.trim(),
        Age: age.trim(),
        chosedSubject: chosedSubject.trim(),
        "chosed subject": chosedSubject.trim(),
        uid: user?.uid || "guest"
      };

      const updatedDoc = await updateUserProfileInFirestore(user?.uid || "profile", payload);

      setSuccess("Profile details submitted successfully!");
      setTimeout(() => {
        onComplete(updatedDoc);
        setMode("view");
      }, 600);
    } catch (err: any) {
      console.error("Error updating profile in Firestore:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account action
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteUserAccountFromFirestore(user);
      setSuccess("Account and records permanently deleted from Firestore.");
      setTimeout(() => {
        if (onAccountDeleted) {
          onAccountDeleted();
        } else if (onClose) {
          onClose();
        }
      }, 800);
    } catch (err: any) {
      console.error("Error deleting user account:", err);
      setError(err.message || "Could not delete account. Re-authentication may be required.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-500/20 backdrop-blur-xs flex flex-col items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 z-50 fixed inset-0 overflow-y-auto" id="learner-profile-container">
      
      {/* Glowing Edge Light Container */}
      <div className="relative w-full max-w-xl my-auto">
        {/* Ambient Glow Halo on Card Edges */}
        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 opacity-60 blur-md animate-pulse" />
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 opacity-80" />

        <div className="relative w-full bg-white border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in overflow-hidden">
          
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-teal-600" />

        {/* Close Modal Button if modal */}
        {isModalMode && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            id="close-profile-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <NextReadLogo size="sm" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Firestore Learner Profile
            </div>
            <h1 className="text-xl font-black text-gray-950 tracking-tight">
              {mode === "view" ? "Learner Document Profile" : mode === "edit" ? "Edit Learner Profile" : "Delete Account Zone"}
            </h1>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md mx-auto">
              Document Path: <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">/users/{user?.uid || "{{uid}}"}</span>
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake" id="profile-error-alert">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in" id="profile-success-alert">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{success}</span>
          </div>
        )}

        {/* MODE 1: VIEW PROFILE DISPLAY */}
        {mode === "view" && (
          <div className="space-y-6" id="view-profile-section">
            
            {/* User Avatar Card Header */}
            <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100/60 rounded-2xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 overflow-hidden">
                {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http")) ? (
                  <img src={photoFileName} alt={name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <span>{name ? name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-gray-950 truncate">{name}</h2>
                <p className="text-xs text-gray-500 truncate">{email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    <GraduationCap className="w-3 h-3" /> Grade {grade}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <BookOpen className="w-3 h-3" /> {chosedSubject}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" /> Full Name
                </span>
                <span className="font-bold text-gray-900 block truncate">{name}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" /> Email
                </span>
                <span className="font-bold text-gray-900 block truncate">{email}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" /> Location
                </span>
                <span className="font-bold text-gray-900 block truncate">{location}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" /> Phone Number
                </span>
                <span className="font-bold text-gray-900 block truncate">{phone}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <School className="w-3 h-3 text-indigo-500" /> School
                </span>
                <span className="font-bold text-gray-900 block truncate">{school}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-500" /> Grade
                </span>
                <span className="font-bold text-gray-900 block truncate">Grade {grade}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" /> Age
                </span>
                <span className="font-bold text-gray-900 block truncate">{age} years old</span>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-indigo-500" /> Profile Photo
                </span>
                <span className="font-bold text-gray-900 block truncate text-xs">
                  {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http"))
                    ? "Uploaded Custom Photo"
                    : "Default Avatar"}
                </span>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setMode("edit")}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                id="edit-profile-btn"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setMode("delete")}
                className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="open-delete-modal-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>

            {isModalMode && onClose && (
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors cursor-pointer text-center"
              >
                Close Profile
              </button>
            )}

          </div>
        )}

        {/* MODE 2: EDIT PROFILE FORM */}
        {mode === "edit" && (
          <form onSubmit={handleSubmit} className="space-y-4" id="edit-profile-form">
            
            {/* Profile Photo Upload Header */}
            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden border-2 border-indigo-100/80">
                  {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http")) ? (
                    <img src={photoFileName} alt={name || "Profile"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>

                {/* Camera Upload Badge */}
                <label
                  htmlFor="profile-photo-upload"
                  className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg cursor-pointer transition-all border-2 border-white flex items-center justify-center hover:scale-105"
                  title="Upload profile photo"
                  id="btn-upload-photo-icon"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Remove photo button */}
                {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http")) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md cursor-pointer transition-all border-2 border-white hover:scale-105"
                    title="Remove profile photo"
                    id="btn-remove-photo-icon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <label
                    htmlFor="profile-photo-upload"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http"))
                      ? "Change Photo"
                      : "Upload Photo"}
                  </label>
                  {photoFileName && (photoFileName.startsWith("data:image") || photoFileName.startsWith("http")) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-full-name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Age <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-age"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <PhoneInputWithCountry
                  value={phone}
                  onChange={(fullPhone) => setPhone(fullPhone)}
                  placeholder="712 345 678"
                  required
                  id="input-phone"
                />
              </div>
            </div>

            {/* School & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  School Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lincoln High School"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-school"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-location"
                  />
                </div>
              </div>
            </div>

            {/* Grade & Chosen Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Grade / Class <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 10"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-grade"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Chosen Subject <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={chosedSubject}
                    onChange={(e) => setChosedSubject(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:bg-white text-xs outline-none rounded-xl font-semibold text-gray-900"
                    id="input-subject"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit & Cancel */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                id="save-profile-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                )}
              </button>

              {initialData && initialData.name && (
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="cancel-edit-btn"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        )}

        {/* MODE 3: DELETE ACCOUNT CONFIRMATION */}
        {mode === "delete" && (
          <div className="w-full flex flex-col items-center text-center py-1" id="delete-account-section">
            
            {/* Color Accent Bars / Brand Badge */}
            <div className="mb-4 flex flex-col items-center">
              <div className="bg-[#411530] text-white text-[11px] font-bold px-3 py-1 rounded-md mb-1.5 shadow-sm">
                learnadm
              </div>
              <div className="w-20 h-1.5 bg-[#f3b23e] rounded-full mb-1"></div>
              <div className="w-16 h-1.5 bg-[#fde3a7] rounded-full mb-1"></div>
              <div className="w-18 h-1.5 bg-[#2c5d68] rounded-full mb-1"></div>
              <div className="w-14 h-1.5 bg-[#5e7153] rounded-full"></div>
            </div>

            <div className="bg-indigo-50 text-indigo-700 text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Learner Profile Settings</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Delete Account Zone
            </h1>

            <div className="text-[11px] font-mono text-indigo-800 bg-indigo-50/70 px-3 py-1 rounded-md mb-5">
              Account ID: <span className="font-semibold">#{user?.uid ? user.uid.slice(0, 8) : "usr_849204"}</span>
            </div>

            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Are you sure you want to delete your account?
            </h2>

            <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-[280px]">
              This will permanently delete your user profile and erase your account data from our system.
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                id="confirm-delete-account-btn"
                className="w-full bg-[#e60039] hover:bg-[#c40030] active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Permanently Delete My Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("view")}
                disabled={isDeleting}
                id="cancel-delete-btn"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  </div>
  );
};
