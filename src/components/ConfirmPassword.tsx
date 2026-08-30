import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, KeyRound, Loader2 } from "lucide-react";

export const ConfirmPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query parameters from Firebase email link or manual navigation
  const queryCode = searchParams.get("oobCode") || searchParams.get("code") || "";
  const queryEmail = searchParams.get("email") || "";

  const [resetCode, setResetCode] = useState<string>(queryCode);
  const [targetEmail, setTargetEmail] = useState<string>(queryEmail);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
  const [codeVerified, setCodeVerified] = useState<boolean>(false);

  // Form state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Automatically verify code if present in URL
  useEffect(() => {
    if (queryCode) {
      setIsVerifyingCode(true);
      verifyPasswordResetCode(auth, queryCode)
        .then((email) => {
          setTargetEmail(email);
          setCodeVerified(true);
          setResetCode(queryCode);
        })
        .catch((err) => {
          console.warn("Invalid or expired reset code:", err);
          setErrorMessage("This password reset link is invalid or has expired. Please request a new one.");
        })
        .finally(() => {
          setIsVerifyingCode(false);
        });
    }
  }, [queryCode]);

  const handleManualVerifyCode = async () => {
    if (!resetCode.trim()) {
      setErrorMessage("Please enter the recovery code sent to your email.");
      return;
    }
    setErrorMessage(null);
    setIsVerifyingCode(true);
    try {
      const email = await verifyPasswordResetCode(auth, resetCode.trim());
      setTargetEmail(email);
      setCodeVerified(true);
    } catch (err: any) {
      console.error("Code verification error:", err);
      setErrorMessage("The recovery code entered is invalid or has expired.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    const codeToUse = resetCode.trim() || queryCode;
    if (!codeToUse) {
      setErrorMessage("A valid recovery code is required to reset your password.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, codeToUse, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Password reset confirmation failed:", err);
      let msg = err.message || "Failed to reset password. Please try again.";
      if (err.code === "auth/expired-action-code") {
        msg = "Your reset code has expired. Please request a new recovery link.";
      } else if (err.code === "auth/invalid-action-code") {
        msg = "The reset code is invalid. It may have already been used.";
      } else if (err.code === "auth/weak-password") {
        msg = "Please choose a stronger password (at least 6 characters).";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculation
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#1D2B4F] flex flex-col justify-between font-sans selection:bg-[#FFD43B]/30">
      <style>{`
        :root {
          --ink: #1D2B4F;
          --ink-soft: #4B5875;
          --ink-faint: #8E99AF;
          --bg: #EEF3F8;
          --card: #FFFFFF;
          --card-border: #D8E1EC;
          --yellow: #FFD43B;
          --green: #2F9E44;
        }
      `}</style>

      {/* TOP BAR */}
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
          to="/login"
          className="text-xs sm:text-sm font-semibold text-[#4B5875] hover:text-[#1D2B4F] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign in</span>
        </Link>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#D8E1EC] rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
          
          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="text-center py-4" id="confirm-password-success">
              <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C8E6C9]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-[#1D2B4F] mb-2 font-['Space_Grotesk',sans-serif]">
                Password Updated!
              </h2>
              <p className="text-sm text-[#4B5875] mb-6 leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new credentials.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3.5 px-4 bg-[#1D2B4F] text-white font-bold rounded-xl text-sm hover:bg-[#273A6B] transition-all shadow-md active:scale-[0.99]"
                id="btn-goto-signin"
              >
                Sign In Now →
              </button>
            </div>
          ) : (
            <div>
              {/* HEADER */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#EEF3F8] border border-[#D8E1EC] text-[#1D2B4F] inline-flex items-center justify-center text-xl mb-3 shadow-sm">
                  <KeyRound className="w-6 h-6 text-[#1D2B4F]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1D2B4F] tracking-tight font-['Space_Grotesk',sans-serif]">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-[#4B5875] mt-1.5">
                  {targetEmail ? (
                    <>Resetting password for <b className="text-[#1D2B4F]">{targetEmail}</b></>
                  ) : (
                    "Enter your confirmation recovery code and choose a new password."
                  )}
                </p>
              </div>

              {/* ERROR NOTIFICATION */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* CODE VERIFICATION FIELD (IF CODE NOT IN URL OR VERIFIED YET) */}
              {!queryCode && !codeVerified && (
                <div className="mb-5 p-4 bg-[#F8FAFC] border border-[#D8E1EC] rounded-xl">
                  <label className="block text-xs font-bold text-[#1D2B4F] mb-1.5 uppercase tracking-wider">
                    Recovery Code (oobCode)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-xs font-mono border border-[#D8E1EC] rounded-lg bg-white focus:outline-none focus:border-[#1D2B4F]"
                      placeholder="Paste code from email link..."
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleManualVerifyCode}
                      disabled={isVerifyingCode || !resetCode.trim()}
                      className="px-3 py-2 bg-[#1D2B4F] text-white text-xs font-semibold rounded-lg hover:bg-[#273A6B] disabled:opacity-50 flex items-center gap-1"
                    >
                      {isVerifyingCode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Verify
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8E99AF] mt-1.5">
                    Check the email you received for the confirmation link or paste the code here.
                  </p>
                </div>
              )}

              {/* PASSWORD RESET FORM */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4" id="form-confirm-password">
                {/* NEW PASSWORD */}
                <div>
                  <label className="block text-xs font-bold text-[#1D2B4F] mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-[#D8E1EC] rounded-xl text-sm bg-white text-[#1D2B4F] placeholder-[#8E99AF] focus:outline-none focus:border-[#1D2B4F] focus:ring-2 focus:ring-[#1D2B4F]/10 pr-10"
                      placeholder="Enter at least 6 characters"
                      required
                      autoFocus
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      id="input-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E99AF] hover:text-[#1D2B4F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-xs font-bold text-[#1D2B4F] mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="w-full px-4 py-3 border border-[#D8E1EC] rounded-xl text-sm bg-white text-[#1D2B4F] placeholder-[#8E99AF] focus:outline-none focus:border-[#1D2B4F] focus:ring-2 focus:ring-[#1D2B4F]/10 pr-10"
                      placeholder="Re-type your new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      id="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E99AF] hover:text-[#1D2B4F]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CRITERIA CHECKLIST */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-[#8E99AF]"}`}>
                    <span className="text-xs">{hasMinLength ? "✓" : "○"}</span>
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordsMatch ? "text-emerald-700 font-semibold" : "text-[#8E99AF]"}`}>
                    <span className="text-xs">{passwordsMatch ? "✓" : "○"}</span>
                    <span>Passwords match</span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading || !hasMinLength || (confirmPassword.length > 0 && !passwordsMatch)}
                  className="w-full py-3.5 px-4 bg-[#1D2B4F] text-white font-bold rounded-xl text-sm hover:bg-[#273A6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                  id="btn-submit-confirm-password"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save New Password & Sign In</span>
                </button>
              </form>

              {/* FOOTER ACTIONS */}
              <div className="mt-6 pt-4 border-t border-[#D8E1EC] text-center text-xs text-[#4B5875] space-y-2">
                <p>
                  Remembered your password?{" "}
                  <Link to="/login" className="font-bold text-[#1D2B4F] hover:underline">
                    Sign in
                  </Link>
                </p>
                <p>
                  Need a fresh link?{" "}
                  <Link to="/reset-password" className="font-semibold text-[#1D2B4F] hover:underline">
                    Request new recovery email
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-4 text-center text-xs text-[#8E99AF]">
        Learn Adm CBE Curriculum Platform · Secure Password Recovery
      </footer>
    </div>
  );
};
