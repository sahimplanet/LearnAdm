import React, { useState, useEffect, useRef } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth, googleProvider, getActionCodeSettings } from "../lib/firebase";
import { ensureUserInFirestore, updateUserProfileInFirestore } from "../lib/userService";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onBackToLanding?: () => void;
  initialTab?: TabMode;
  initialPanel?: PanelMode;
}

type TabMode = "signin" | "signup";
type PanelMode = "auth" | "verify" | "forgot" | "forgot-success" | "success";

export const Login: React.FC<LoginProps> = ({ 
  onLoginSuccess, 
  onBackToLanding,
  initialTab = "signin",
  initialPanel = "auth"
}) => {
  const [tab, setTab] = useState<TabMode>(initialTab);
  const [panel, setPanel] = useState<PanelMode>(initialPanel);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialPanel) {
      setPanel(initialPanel);
    }
  }, [initialPanel]);

  // Sign In fields
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Sign Up fields
  const [fullname, setFullname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // OTP digits
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTitle, setSuccessTitle] = useState("You're all set!");
  const [successSub, setSuccessSub] = useState("Taking you to your dashboard…");
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Resend Timer
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Floating symbols for success
  const [floatingSymbols, setFloatingSymbols] = useState<Array<{ symbol: string; left: number; top: number; delay: number; id: number }>>([]);

  // Resend countdown effect
  useEffect(() => {
    let interval: any;
    if ((panel === "verify" || panel === "forgot-success") && !canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [panel, canResend, resendTimer]);

  const triggerSuccessView = (title: string, sub: string, targetUser: any) => {
    setSuccessTitle(title);
    setSuccessSub(sub);
    setPanel("success");
    setError(null);

    // Generate math symbols
    const symbols = ["+", "−", "×", "÷", "="];
    const generated = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: 10 + Math.random() * 60,
      top: 30 + Math.random() * 20,
      delay: Math.random() * 0.5
    }));
    setFloatingSymbols(generated);

    setTimeout(() => {
      onLoginSuccess(targetUser);
    }, 1600);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, signinEmail.trim(), signinPassword);
      const user = userCredential.user;

      await ensureUserInFirestore(user, {
        email: signinEmail.trim(),
        Email: signinEmail.trim()
      });

      triggerSuccessView("Welcome back!", "Taking you to your dashboard…", user);
    } catch (err: any) {
      console.error("Sign in error:", err);
      let msg = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password. Please double-check your credentials.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please reset your password or wait a moment.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (signupPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const user = userCredential.user;

      if (fullname.trim()) {
        await updateProfile(user, { displayName: fullname.trim() });
      }

      // Save complete learner profile
      await updateUserProfileInFirestore(user.uid, {
        name: fullname.trim(),
        "Full Name": fullname.trim(),
        email: signupEmail.trim(),
        Email: signupEmail.trim(),
        school: school.trim(),
        grade: grade || "Grade 8",
        Grade: grade || "Grade 8",
        gender: gender || "Prefer not to say",
        phone: phone.trim(),
        "phone number": phone.trim(),
        location: location.trim(),
        Location: location.trim()
      });

      try {
        await sendEmailVerification(user, getActionCodeSettings());
      } catch (mailErr) {
        console.warn("Could not send verification email:", mailErr);
      }

      setRegisteredUser(user);
      setResendTimer(30);
      setCanResend(false);
      setPanel("verify");
    } catch (err: any) {
      console.error("Sign up error:", err);
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      await ensureUserInFirestore(user, {
        name: user.displayName || "Google Learner",
        "Full Name": user.displayName || "Google Learner",
        email: user.email || "",
        Email: user.email || ""
      });

      triggerSuccessView("Signed in with Google", "Taking you to your dashboard…", user);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let msg = err.message;
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Sign-in popup was closed before completing.";
      } else if (err.code === "auth/cancelled-popup-request") {
        msg = "Sign-in request was cancelled.";
      }
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const updated = [...otp];
    updated[index] = clean.slice(-1);
    setOtp(updated);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = () => {
    const target = registeredUser || auth.currentUser;
    triggerSuccessView(
      tab === "signin" ? "Welcome back!" : "You're all set!",
      tab === "signin" ? "Email verified. Taking you to your dashboard…" : "Your account is ready. Taking you to your dashboard…",
      target
    );
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(30);
    setError(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, getActionCodeSettings());
      }
    } catch (err) {
      console.warn("Error resending email:", err);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      try {
        await sendPasswordResetEmail(auth, cleanEmail, getActionCodeSettings());
      } catch (settingsErr) {
        // Fallback without actionCodeSettings if domain is not configured
        await sendPasswordResetEmail(auth, cleanEmail);
      }
      setResetSuccessMsg(`We sent a password reset link to ${cleanEmail}. Check your inbox and follow the link to reset your password.`);
      setPanel("forgot-success");
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let msg = err.message;
      if (err.code === "auth/user-not-found") {
        msg = "No registered account found with this email address. Please check your spelling or sign up.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The email address format is invalid. Please enter a valid email.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many reset attempts. Please wait a few minutes before trying again.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPasswordReset = async () => {
    if (!canResend || !forgotEmail.trim()) return;
    setCanResend(false);
    setResendTimer(30);
    setError(null);

    try {
      try {
        await sendPasswordResetEmail(auth, forgotEmail.trim(), getActionCodeSettings());
      } catch (settingsErr) {
        await sendPasswordResetEmail(auth, forgotEmail.trim());
      }
      setResetSuccessMsg(`New reset link sent to ${forgotEmail.trim()}!`);
    } catch (err: any) {
      console.error("Error resending password reset:", err);
      setError("Could not resend email. Please wait a moment and try again.");
    }
  };

  return (
    <div className="login-wrapper" id="login-container">
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
          --coral: #FF6B6B;
          --card: #FFFFFF;
          --card-border: #D8E1EC;
          --radius: 14px;
        }
        
        .login-wrapper {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 16px;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .login-page {
          width: 100%;
          max-width: 440px;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 22px;
          text-align: center;
        }
        
        .brand-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
        }

        .logo-mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--yellow);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 16px;
          user-select: none;
        }

        .brand-row span.name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 21px;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .brand p {
          font-size: 13.5px;
          color: var(--ink-soft);
        }

        .auth-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 20px;
          padding: 30px 28px 26px;
          box-shadow: 0 12px 34px rgba(29,43,79,0.08);
          position: relative;
          overflow: hidden;
        }

        .auth-panel {
          animation: fadeIn .35s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tabs {
          display: flex;
          background: var(--bg);
          border: 1px solid var(--card-border);
          border-radius: 11px;
          padding: 4px;
          margin-bottom: 20px;
        }

        .tab {
          flex: 1;
          border: none;
          background: transparent;
          padding: 9px 0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--ink-faint);
          cursor: pointer;
          transition: background .2s, color .2s;
        }

        .tab.active {
          background: var(--ink);
          color: #fff;
        }

        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #fff;
          border: 1.5px solid var(--card-border);
          border-radius: 10px;
          padding: 11px 0;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          color: var(--ink);
          cursor: pointer;
          transition: border-color .2s, box-shadow .2s;
        }

        .btn-google:hover {
          border-color: var(--ink-faint);
          box-shadow: 0 4px 12px rgba(29,43,79,0.08);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--card-border);
        }

        .divider span {
          font-size: 12px;
          color: var(--ink-faint);
          white-space: nowrap;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
        }

        .field input, .field select {
          width: 100%;
          padding: 11px 13px;
          border-radius: 9px;
          border: 1.5px solid var(--card-border);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fff;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .field input:focus, .field select:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .forgot-row button {
          background: none;
          border: none;
          font-size: 12.5px;
          color: var(--ink-soft);
          font-weight: 500;
          cursor: pointer;
        }

        .forgot-row button:hover {
          color: var(--ink);
          text-decoration: underline;
        }

        .btn-primary {
          width: 100%;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 0;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          margin-top: 4px;
          transition: transform .15s, box-shadow .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover {
          box-shadow: 0 8px 20px rgba(29,43,79,0.25);
        }

        .btn-primary:active {
          transform: translateY(1px);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .switch-line {
          text-align: center;
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 18px;
        }

        .switch-line button {
          background: none;
          border: none;
          color: var(--green);
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        }

        .switch-line button:hover {
          text-decoration: underline;
        }

        /* Verify Panel Styles */
        .verify-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
          position: relative;
          height: 74px;
        }

        .verify-icon .ring {
          position: absolute;
          width: 74px;
          height: 74px;
          border-radius: 50%;
          border: 2px solid var(--green-soft);
          animation: ringPulse 2.2s ease-out infinite;
        }

        .verify-icon .ring:nth-child(2) {
          animation-delay: 0.7s;
        }

        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .verify-icon svg {
          position: relative;
          z-index: 1;
          width: 56px;
          height: 56px;
        }

        .verify-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          text-align: center;
          margin-bottom: 6px;
          color: var(--ink);
          font-weight: 700;
        }

        .verify-sub {
          font-size: 13.5px;
          color: var(--ink-soft);
          text-align: center;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .verify-sub b {
          color: var(--ink);
        }

        .otp-row {
          display: flex;
          gap: 9px;
          justify-content: center;
          margin-bottom: 18px;
        }

        .otp-row input {
          width: 42px;
          height: 50px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 19px;
          font-weight: 700;
          border-radius: 9px;
          border: 1.5px solid var(--card-border);
          outline: none;
          color: var(--ink);
          background: #fff;
          transition: border-color .2s, box-shadow .2s;
        }

        .otp-row input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .resend-line {
          text-align: center;
          font-size: 12.5px;
          color: var(--ink-faint);
          margin-bottom: 18px;
        }

        .resend-line button {
          background: none;
          border: none;
          color: var(--green);
          font-weight: 600;
          cursor: pointer;
          font-size: 12.5px;
        }

        .resend-line button:disabled {
          color: var(--ink-faint);
          cursor: default;
        }

        .back-line {
          text-align: center;
          font-size: 12.5px;
          margin-top: 16px;
        }

        .back-line button {
          background: none;
          border: none;
          color: var(--ink-soft);
          font-size: 12.5px;
          cursor: pointer;
          font-weight: 500;
        }

        .back-line button:hover {
          color: var(--ink);
        }

        /* Success Panel Styles */
        .success-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          height: 80px;
        }

        .success-circle {
          width: 80px;
          height: 80px;
        }

        .success-circle circle {
          fill: none;
          stroke: var(--green);
          stroke-width: 4;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: drawCircle .6s ease forwards;
        }

        .success-circle path {
          fill: none;
          stroke: var(--green);
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: drawCheck .35s ease forwards .55s;
        }

        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }

        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        .float-symbols {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .float-symbols span {
          position: absolute;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 15px;
          color: var(--yellow);
          opacity: 0;
          animation: floatUp 1.6s ease-out forwards;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-70px) rotate(20deg); }
        }

        .loading-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin: 6px 0 20px;
        }

        .loading-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--ink-faint);
          animation: bounce 1s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: .15s; }
        .loading-dots span:nth-child(3) { animation-delay: .3s; }

        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); opacity: .5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        .auth-error-banner {
          margin-bottom: 16px;
          padding: 10px 12px;
          background: #FFF5F5;
          border: 1px solid #FFE3E3;
          border-radius: 9px;
          color: #C92A2A;
          font-size: 12.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.4;
        }

        @media (max-width: 460px) {
          .row-2 { grid-template-columns: 1fr; }
          .otp-row input { width: 38px; height: 46px; }
        }
      `}</style>

      {/* Optional Top Return button to Landing Page */}
      {onBackToLanding && (
        <div style={{ width: "100%", maxWidth: "440px", marginBottom: "12px", display: "flex", justifyContent: "flex-start" }}>
          <button
            onClick={onBackToLanding}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "#fff",
              border: "1.5px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--ink-soft)",
              cursor: "pointer"
            }}
            id="back-to-landing-btn"
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Back to home</span>
          </button>
        </div>
      )}

      <div className="login-page">
        {/* BRAND HEADER */}
        <div className="brand" id="login-brand-header">
          <div className="brand-row">
            <span className="logo-mark">L</span>
            <span className="name">Learn Adm</span>
          </div>
          <p>Turn hard problems into easy steps — grade 7 to 12</p>
        </div>

        {/* AUTH CARD */}
        <div className="auth-card" id="login-auth-card">
          
          {/* Error Message Box */}
          {error && (
            <div className="auth-error-banner" id="login-error-message">
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANEL 1: SIGN IN / SIGN UP                                   */}
          {/* ============================================================ */}
          {panel === "auth" && (
            <div className="auth-panel" id="panelAuth">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${tab === "signin" ? "active" : ""}`}
                  onClick={() => {
                    setTab("signin");
                    setError(null);
                  }}
                  id="tab-signin-btn"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`tab ${tab === "signup" ? "active" : ""}`}
                  onClick={() => {
                    setTab("signup");
                    setError(null);
                  }}
                  id="tab-signup-btn"
                >
                  Sign up
                </button>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
                id="btn-google-auth"
              >
                {googleLoading ? (
                  <Loader2 style={{ width: "18px", height: "18px" }} className="animate-spin text-slate-700" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="divider">
                <span>or continue with email</span>
              </div>

              {/* SIGN IN FORM */}
              {tab === "signin" ? (
                <form className="auth-form" onSubmit={handleSignInSubmit} id="signinForm">
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      id="signin-email-input"
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      id="signin-password-input"
                    />
                  </div>
                  <div className="forgot-row">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(signinEmail);
                        setPanel("forgot");
                        setError(null);
                      }}
                      id="forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading} id="signin-submit-btn">
                    {isLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
                    <span>Sign in</span>
                  </button>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form className="auth-form" onSubmit={handleSignUpSubmit} id="signupForm">
                  <div className="field">
                    <label>Full name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      required
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      id="signup-fullname-input"
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      id="signup-email-input"
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      id="signup-password-input"
                    />
                  </div>
                  <div className="field">
                    <label>School</label>
                    <input
                      type="text"
                      placeholder="e.g. Green Valley High School"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      id="signup-school-input"
                    />
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>Current grade</label>
                      <select
                        required
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        id="signup-grade-select"
                      >
                        <option value="" disabled>Select grade</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Gender</label>
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        id="signup-gender-select"
                      >
                        <option value="" disabled>Select</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Phone number</label>
                    <input
                      type="tel"
                      placeholder="+254 700 000 000"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="signup-phone-input"
                    />
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="Town / City, Country"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      id="signup-location-input"
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading} id="signup-submit-btn">
                    {isLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
                    <span>Create account</span>
                  </button>
                </form>
              )}

              {/* Bottom Mode Switcher */}
              <p className="switch-line" id="switchLine">
                {tab === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signup");
                        setError(null);
                      }}
                      id="switch-to-signup-btn"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signin");
                        setError(null);
                      }}
                      id="switch-to-signin-btn"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANEL 2: FORGOT PASSWORD                                     */}
          {/* ============================================================ */}
          {panel === "forgot" && (
            <div className="auth-panel" id="panelForgot">
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--bg)",
                    border: "1.5px solid var(--card-border)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    color: "var(--ink)"
                  }}
                >
                  🔑
                </div>
              </div>

              <h2 className="verify-title" style={{ marginTop: "2px" }}>Reset your password</h2>
              <p className="verify-sub">
                Enter your account email and we'll send you an official password reset link.
              </p>

              <form className="auth-form" onSubmit={handleForgotPasswordSubmit} id="forgotPasswordForm">
                <div className="field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoFocus
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    id="forgot-email-input"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                  id="forgot-submit-btn"
                >
                  {isLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
                  <span>Send recovery email</span>
                </button>
              </form>

              <p className="back-line">
                <button
                  type="button"
                  onClick={() => {
                    setPanel("auth");
                    setError(null);
                  }}
                  id="back-to-auth-from-forgot"
                >
                  ← Back to sign in
                </button>
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANEL 2B: FORGOT PASSWORD - EMAIL SENT SUCCESS               */}
          {/* ============================================================ */}
          {panel === "forgot-success" && (
            <div className="auth-panel" id="panelForgotSuccess">
              <div className="verify-icon">
                <div className="ring"></div>
                <div className="ring"></div>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#1D2B4F" strokeWidth="1.6"/>
                  <path d="M3 6l9 6 9-6" stroke="#2F9E44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 className="verify-title">Check your inbox</h2>
              <p className="verify-sub">
                We've sent a password reset link to <b>{forgotEmail}</b>. Click the link in the email to set a new password.
              </p>

              {resetSuccessMsg && (
                <div
                  style={{
                    background: "#E8F5E9",
                    color: "#2E7D32",
                    border: "1px solid #C8E6C9",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "12.5px",
                    lineHeight: "1.4",
                    marginBottom: "16px",
                    textAlign: "center"
                  }}
                >
                  {resetSuccessMsg}
                </div>
              )}

              <p className="resend-line" id="forgotResendLine">
                {!canResend ? (
                  <>Resend link in <span>{resendTimer}</span>s</>
                ) : (
                  <button type="button" onClick={handleResendPasswordReset} id="resend-forgot-btn">
                    Resend reset email
                  </button>
                )}
              </p>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setSigninEmail(forgotEmail);
                  setTab("signin");
                  setPanel("auth");
                  setError(null);
                }}
                id="back-to-signin-after-forgot-btn"
              >
                Back to sign in
              </button>

              <p style={{ fontSize: "12px", color: "var(--ink-faint)", textAlign: "center", marginTop: "14px", lineHeight: "1.4" }}>
                Didn't get the email? Check your spam folder or try again with your registered address.
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANEL 3: VERIFY EMAIL                                        */}
          {/* ============================================================ */}
          {panel === "verify" && (
            <div className="auth-panel" id="panelVerify">
              <div className="verify-icon">
                <div className="ring"></div>
                <div className="ring"></div>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#1D2B4F" strokeWidth="1.6"/>
                  <path d="M3 6l9 6 9-6" stroke="#2F9E44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 className="verify-title">Check your email</h2>
              <p className="verify-sub">
                We sent a verification link to <b>{signupEmail || signinEmail || forgotEmail || "your email"}</b>. Enter code or confirm to continue.
              </p>

              {/* 6 Digit OTP input */}
              <div className="otp-row">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    id={`otp-input-${idx}`}
                  />
                ))}
              </div>

              <p className="resend-line" id="resendLine">
                {!canResend ? (
                  <>Resend code in <span>{resendTimer}</span>s</>
                ) : (
                  <button type="button" onClick={handleResendCode} id="resend-code-btn">
                    Resend code
                  </button>
                )}
              </p>

              <button
                type="button"
                className="btn-primary"
                onClick={handleVerifySubmit}
                id="verify-submit-btn"
              >
                Verify
              </button>

              <p className="back-line">
                <button
                  type="button"
                  onClick={() => {
                    setPanel("auth");
                    setError(null);
                  }}
                  id="back-to-auth-btn"
                >
                  ← Back
                </button>
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANEL 4: SUCCESS                                             */}
          {/* ============================================================ */}
          {panel === "success" && (
            <div className="auth-panel" id="panelSuccess">
              <div className="success-icon">
                <svg className="success-circle" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35"/>
                  <path d="M25 41l10 10 20-22"/>
                </svg>
                <div className="float-symbols" id="floatSymbols">
                  {floatingSymbols.map((item) => (
                    <span
                      key={item.id}
                      style={{
                        left: `${item.left}%`,
                        top: `${item.top}px`,
                        animationDelay: `${item.delay}s`
                      }}
                    >
                      {item.symbol}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="verify-title" id="successTitle">{successTitle}</h2>
              <p className="verify-sub" id="successSub">{successSub}</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
