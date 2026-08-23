import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth, googleProvider, getActionCodeSettings } from "../lib/firebase";
import { ensureUserInFirestore } from "../lib/userService";
import { NextReadLogo } from "./NextReadLogo";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Send,
  RefreshCw,
  MailCheck,
  ArrowLeft,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

type AuthMode = "signin" | "signup" | "forgot" | "verify_email";

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Email verification & reset states
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  // Countdown timer for resend email
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (authMode === "signup") {
        // Sign Up Flow
        if (!name.trim()) {
          throw new Error("Please enter your name to personalize your learnadm profile.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters for security.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });

        // Send email verification link via Firebase Auth with custom ActionCodeSettings
        try {
          await sendEmailVerification(userCredential.user, getActionCodeSettings());
        } catch (verr: any) {
          console.warn("Notice sending email verification:", verr);
        }

        // Ensure user document exists in Firestore /users/{{uid}}
        await ensureUserInFirestore(userCredential.user, {
          name: name.trim(),
          "Full Name": name.trim(),
          email: userCredential.user.email || email,
          Email: userCredential.user.email || email
        });
        
        setVerifyNotice(`We've sent a verification link to ${email}. Please check your inbox!`);
        setAuthMode("verify_email");
      } else {
        // Sign In Flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Ensure existing user is added to /users/{{uid}} if not present
        await ensureUserInFirestore(userCredential.user, {
          email: userCredential.user.email || email,
          Email: userCredential.user.email || email
        });

        setSuccess("Welcome back! Loading learnadm...");
        setTimeout(() => {
          onLoginSuccess(userCredential.user);
        }, 800);
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      let friendlyMessage = err.message;
      
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already registered. Please switch to Sign In mode.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        friendlyMessage = "Invalid email or password. If you don't have an account yet, please click 'Sign Up' above to create one.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address entered is invalid.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Please choose a stronger password (minimum 6 characters).";
      }

      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim(), getActionCodeSettings());
      setVerifyNotice(`A custom password reset link has been dispatched to ${email}. Please check your inbox and spam folder.`);
      setResendCooldown(30);
      setAuthMode("verify_email");
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      let friendlyMessage = err.message;
      if (err.code === "auth/user-not-found") {
        friendlyMessage = "No account found with this email address. Please check for typos or sign up.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        friendlyMessage = "Too many password reset requests. Please wait a few minutes before trying again.";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending || !email.trim()) return;

    setIsResending(true);
    setError(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, getActionCodeSettings());
        setSuccess("Verification email resent successfully with custom settings!");
      } else {
        await sendPasswordResetEmail(auth, email.trim(), getActionCodeSettings());
        setSuccess("Password reset link resent successfully with custom settings!");
      }
      setResendCooldown(30);
    } catch (err: any) {
      console.error("Resend Email Error:", err);
      setError("Unable to resend email right now. Please wait a moment and try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await ensureUserInFirestore(userCredential.user, {
        name: userCredential.user.displayName || "Google Learner",
        "Full Name": userCredential.user.displayName || "Google Learner",
        email: userCredential.user.email || "",
        Email: userCredential.user.email || ""
      });
      setSuccess(`Signed in as ${userCredential.user.displayName || userCredential.user.email}! Loading learnadm...`);
      setTimeout(() => {
        onLoginSuccess(userCredential.user);
      }, 800);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let friendlyMessage = err.message;

      if (err.code === "auth/popup-closed-by-user") {
        friendlyMessage = "Google Sign-In popup was closed before completing.";
      } else if (err.code === "auth/cancelled-popup-request") {
        friendlyMessage = "Google Sign-In request was cancelled.";
      } else if (err.code === "auth/popup-blocked") {
        friendlyMessage = "Sign-in popup was blocked by browser. Please allow popups.";
      } else if (err.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname;
        friendlyMessage = `Google Sign-In domain unauthorized (${currentDomain}). Please add "${currentDomain}" in Firebase Console > Authentication > Settings > Authorized Domains, or sign in using Email/Password below.`;
      }

      setError(friendlyMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900" id="login-container">
      
      {/* Glowing Edge Light Container */}
      <div className="relative w-full max-w-md">
        {/* Soft Ambient Glow Halo on Card Edges */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 opacity-60 blur-md animate-pulse" />
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 opacity-80" />

        <div className="relative w-full bg-white border border-indigo-100 rounded-2xl p-8 shadow-2xl space-y-6 animate-fade-in overflow-hidden">
          
          {/* Subtle decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-teal-600" />

        {/* ------------------- VIEW 1: VERIFY YOUR EMAIL CARD ------------------- */}
        {authMode === "verify_email" ? (
          <div className="space-y-6 animate-fade-in text-center pt-2" id="verify-email-card">
            
            {/* Animated Floating Envelope Badge */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-ping" />
              <div className="relative w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 border border-indigo-300/40 transform hover:scale-105 transition-transform duration-300">
                <MailCheck className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                <span>Verify Your Email</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                We sent an official Firebase authentication link to your address:
              </p>
            </div>

            {/* Email Address Highlight Pill */}
            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl font-mono text-xs text-indigo-900 font-bold flex items-center justify-center gap-2 shadow-inner">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{email || "your registered email"}</span>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="text-left bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-2 text-xs text-gray-600">
              <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Next Steps to Complete
              </p>
              <div className="flex items-start gap-2">
                <span className="bg-indigo-100 text-indigo-800 font-extrabold rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Open your inbox and search for the email from <strong>Firebase Auth</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-indigo-100 text-indigo-800 font-extrabold rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Click the <strong>verification/password reset link</strong> inside the email.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-indigo-100 text-indigo-800 font-extrabold rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Return here and sign in with your account to access learnadm!</span>
              </div>
            </div>

            {/* Success/Error Notices */}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isResending}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Link"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>

          </div>
        ) : authMode === "forgot" ? (
          /* ------------------- VIEW 2: FORGOT PASSWORD FORM ------------------- */
          <div className="space-y-6 animate-fade-in" id="forgot-password-card">
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-950 tracking-tight">
                  Reset Password
                </h1>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Enter your registered email address below. We'll send you an official Firebase verification link to reset your password.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 focus:bg-white text-xs outline-none rounded-xl font-medium transition-all text-gray-900 placeholder-gray-400"
                    id="forgot-email-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                id="forgot-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Verification Email</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                id="back-to-signin-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          /* ------------------- VIEW 3: SIGN IN / SIGN UP FORM ------------------- */
          <>
            {/* NextRead Logo Prominently Displayed Above Login Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <NextReadLogo size="md" />

              <div>
                <h1 className="text-xl font-extrabold text-gray-950 tracking-tight">
                  {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
                </h1>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Sign in to access your CBE syllabus, study history & AI tutoring
                </p>
              </div>
            </div>

            {/* Dynamic Alerts */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex flex-col gap-2 text-xs text-rose-800 animate-shake" id="login-error-alert">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{error}</span>
                </div>
                {authMode === "signin" && (
                  <div className="flex items-center gap-3 pt-1 border-t border-rose-200/60 pl-6.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                    <span className="text-rose-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in" id="login-success-alert">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold leading-relaxed">{success}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || googleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xs hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              id="google-signin-btn"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center shrink-0">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Or email</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              
              {authMode === "signup" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 focus:bg-white text-xs outline-none rounded-xl font-medium transition-all text-gray-900 placeholder-gray-400"
                      id="signup-name-input"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 focus:bg-white text-xs outline-none rounded-xl font-medium transition-all text-gray-900 placeholder-gray-400"
                    id="login-email-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                      id="forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={authMode === "signup" ? "Create a secure password" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 focus:bg-white text-xs outline-none rounded-xl font-medium transition-all text-gray-900 placeholder-gray-400"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-indigo-600 text-gray-400 transition-colors cursor-pointer"
                    id="password-visibility-toggle"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                id="auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === "signup" ? "Create Account & Verify Email" : "Sign In to learnadm"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up Mode */}
            <div className="text-center text-xs pt-1">
              <span className="text-gray-400">
                {authMode === "signup" ? "Already have an account? " : "Don't have an account yet? "}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === "signup" ? "signin" : "signup");
                  setError(null);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                id="auth-toggle-mode-btn"
              >
                {authMode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </>
        )}

        </div>
      </div>
    </div>
  );
};
