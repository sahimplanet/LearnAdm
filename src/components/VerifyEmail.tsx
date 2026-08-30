import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Mail, ArrowRight, ArrowLeft, Loader2, RefreshCw, Send } from "lucide-react";
import { auth } from "../lib/firebase";
import { updateUserProfileInFirestore } from "../lib/userService";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [token, setToken] = useState<string>(tokenParam);
  const [email, setEmail] = useState<string>(emailParam);

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    tokenParam ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>(emailParam);
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // Automatically verify when token is present
  useEffect(() => {
    if (tokenParam) {
      handleVerifyToken(tokenParam, emailParam);
    }
  }, [tokenParam]);

  const handleVerifyToken = async (tok: string, mailAddr: string) => {
    setStatus("loading");
    setErrorMessage(null);
    setResendSuccess(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tok.trim(), email: mailAddr.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification link is invalid or has expired.");
      }

      setVerifiedEmail(data.email || mailAddr);
      setStatus("success");

      // Update current user's profile state if logged in
      const currentUid = auth.currentUser?.uid || data.uid;
      if (currentUid) {
        try {
          await updateUserProfileInFirestore(currentUid, {
            emailVerified: true,
            isVerified: true,
            verifiedAt: new Date().toISOString()
          });
        } catch (syncErr) {
          console.warn("Notice updating Firestore verification status:", syncErr);
        }
      }

      // Mark locally
      try {
        localStorage.setItem("learnadm_email_verified", "true");
        if (data.email) {
          localStorage.setItem("learnadm_verified_email", data.email);
        }
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error("Email verification error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to verify email. Please request a new link.");
    }
  };

  const handleManualResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setResending(true);
    setErrorMessage(null);
    setResendSuccess(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: auth.currentUser?.displayName || "Learner",
          uid: auth.currentUser?.uid
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not dispatch verification email.");
      }

      setResendSuccess(`A fresh verification link was dispatched to ${email.trim()} via Resend! Please check your inbox.`);
      
      // If server returned a simulation link (e.g. when API key is in development)
      if (data.simulated && data.verificationLink) {
        setResendSuccess(`Verification link generated: You can click the link in your email or click below to verify immediately.`);
      }
    } catch (err: any) {
      console.error("Resend error:", err);
      setErrorMessage(err.message || "Failed to send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#1D2B4F] flex flex-col justify-between font-sans selection:bg-[#FFD43B]/30">
      {/* HEADER */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1D2B4F] hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1D2B4F] text-[#FFD43B] font-bold flex items-center justify-center text-base shadow-sm">
            L
          </div>
          <span>Learn Adm</span>
        </Link>

        <Link
          to={auth.currentUser ? "/dashboard" : "/login"}
          className="text-xs sm:text-sm font-semibold text-[#4B5875] hover:text-[#1D2B4F] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{auth.currentUser ? "Back to Dashboard" : "Back to Sign In"}</span>
        </Link>
      </header>

      {/* MAIN CARD */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#D8E1EC] rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden" id="verify-email-card">
          
          {/* 1. LOADING STATE */}
          {status === "loading" && (
            <div className="text-center py-8" id="verify-loading-state">
              <div className="w-14 h-14 bg-[#EEF3F8] text-[#1D2B4F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D8E1EC]">
                <Loader2 className="w-7 h-7 animate-spin text-[#1D2B4F]" />
              </div>
              <h2 className="text-xl font-bold text-[#1D2B4F] mb-1.5 font-['Space_Grotesk',sans-serif]">
                Verifying Your Email...
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5875]">
                Please wait while we confirm your email credentials via Resend.
              </p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === "success" && (
            <div className="text-center py-4" id="verify-success-state">
              <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C8E6C9]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold uppercase tracking-wider rounded-full mb-2">
                Resend Verified
              </span>

              <h1 className="text-2xl font-bold text-[#1D2B4F] mb-2 font-['Space_Grotesk',sans-serif]">
                Email Verified!
              </h1>
              <p className="text-xs sm:text-sm text-[#4B5875] mb-6 leading-relaxed">
                Thank you! Your email <b className="text-[#1D2B4F]">{verifiedEmail || "address"}</b> has been successfully verified. Your account is now fully active.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3.5 px-4 bg-[#1D2B4F] text-white font-bold rounded-xl text-sm hover:bg-[#273A6B] transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                  id="btn-goto-dashboard"
                >
                  <span>Go to My Learning Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!auth.currentUser && (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full py-2.5 px-4 bg-white border border-[#D8E1EC] text-[#1D2B4F] font-semibold rounded-xl text-xs hover:bg-[#F8FAFC] transition-colors"
                  >
                    Sign in with your password &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. ERROR OR IDLE FORM */}
          {(status === "error" || status === "idle") && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#EEF3F8] border border-[#D8E1EC] text-[#1D2B4F] inline-flex items-center justify-center text-xl mb-3 shadow-sm">
                  <Mail className="w-6 h-6 text-[#1D2B4F]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1D2B4F] tracking-tight font-['Space_Grotesk',sans-serif]">
                  {status === "error" ? "Verification Link Expired" : "Email Verification"}
                </h1>
                <p className="text-xs sm:text-sm text-[#4B5875] mt-1.5">
                  {status === "error"
                    ? "The link you clicked may have expired or is invalid. Request a new verification link below."
                    : "Enter your registered email address to receive an official Resend confirmation link."}
                </p>
              </div>

              {/* ERROR NOTIFICATION */}
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* SUCCESS NOTIFICATION */}
              {resendSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                  <div className="flex-1 leading-relaxed">{resendSuccess}</div>
                </div>
              )}

              {/* RESEND / VERIFY FORM */}
              <form onSubmit={handleManualResend} className="space-y-4" id="form-resend-verification">
                <div>
                  <label className="block text-xs font-bold text-[#1D2B4F] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#D8E1EC] rounded-xl text-sm bg-white text-[#1D2B4F] placeholder-[#8E99AF] focus:outline-none focus:border-[#1D2B4F] focus:ring-2 focus:ring-[#1D2B4F]/10"
                    id="input-resend-email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending || !email}
                  className="w-full py-3.5 px-4 bg-[#1D2B4F] text-white font-bold rounded-xl text-sm hover:bg-[#273A6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                  id="btn-submit-resend"
                >
                  {resending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{resending ? "Dispatching Email..." : "Send Verification Email via Resend"}</span>
                </button>
              </form>

              {/* BACK TO LOGIN */}
              <div className="mt-6 pt-4 border-t border-[#D8E1EC] text-center text-xs text-[#4B5875]">
                <Link to="/login" className="font-bold text-[#1D2B4F] hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-4 text-center text-xs text-[#8E99AF]">
        Learn Adm CBE Curriculum Platform &middot; Powered by Resend Email Verification
      </footer>
    </div>
  );
};
