"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X, Mail, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CafeAdminLogin({ params }: { params: { menupages: string } }) {
  const { menupages } = params;
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const { toast } = useToast();
  
  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  
  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cooldown, setCooldown] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  }, [cooldownTimer]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }
      router.push(`/${menupages}/admin`);
    } catch (err: any) {
      setErrors({ login: err.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password link click
  const handleForgotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setCurrentStep('email');
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  // Handle send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      setErrors({ email: `Please wait ${cooldown}s before requesting a new code.` });
      return;
    }
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send code');
      }
      if (data.sent) {
        setCurrentStep('otp');
        setErrors({});
        toast({
          title: "Verification code sent",
          description: `We sent a code to ${email}`,
        });
        // Start resend cooldown
        setCooldown(60);
        const t = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(t);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setCooldownTimer(t);
      } else {
        setErrors({ email: 'Email not found for this cafe' });
      }
    } catch (err: any) {
      setErrors({ email: err.message || 'Failed to send code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid code');
      }
      setCurrentStep('newPassword');
      setErrors({});
      toast({
        title: "Code verified",
        description: "Enter your new password",
      });
    } catch (err: any) {
      setErrors({ otp: err.message || 'Invalid code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: {[key: string]: string} = {};
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!strong.test(newPassword)) {
        newErrors.newPassword = "Password must be 8+ chars, include uppercase, number, special char";
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // If server provided field info, attach to appropriate field
        if (data?.field === 'newPassword' && data?.message) {
          setErrors({ newPassword: data.message });
          return;
        }
        throw new Error(data.message || 'Failed to reset password');
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setShowSuccess(false);
        setCurrentStep('email');
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1600);
      toast({
        title: "Password updated",
        description: "You can now log in with the new password",
      });
    } catch (err: any) {
      setErrors({ newPassword: err.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowForgotModal(false);
    setCurrentStep('email');
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowSuccess(false);
    setCooldown(0);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={onLogin}
        className="w-full max-w-md md:max-w-lg mx-auto bg-card rounded-2xl md:rounded-3xl border-2 border-gray-200 p-6 md:p-8 space-y-6 shadow-lg"
      >
        <div className="text-3xl font-bold text-center">
          <span className="text-primary">Smart</span>dini
        </div>
        <div className="text-center text-sm text-muted-foreground">Cafe Admin Portal</div>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-1 block font-medium text-gray-700">Username</label>
            <Input
              required
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter username / store id"
              autoComplete="username"
              className="h-11 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                required
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="pr-9 h-11 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Toggle password"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {errors.login && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errors.login}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 border-2 border-primary/20">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Log In to Dashboard'
            )}
          </Button>
          
          {/* Forgot Password Link */}
          <div className="text-xs text-right">
            <button 
              onClick={handleForgotClick}
              className="text-primary font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        </div>
        
        <div className="text-[10px] text-center text-gray-500 border-t border-gray-200 pt-4">
          © 2026 Smartdini. All rights reserved.
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Reset Password</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {showSuccess ? (
                // Success Message
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Password Changed!</h4>
                  <p className="text-sm text-gray-600">
                    Your password has been successfully updated.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: Email */}
                  {currentStep === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Enter your email address to receive a verification code.
                      </div>
                      <div>
                        <label className="text-sm mb-1 block font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@cafe.com"
                            className={`pl-9 h-11 border-2 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: OTP */}
                  {currentStep === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        We've sent a 6-digit verification code to <strong>{email}</strong>
                      </div>
                      <div>
                        <label className="text-sm mb-1 block font-medium text-gray-700">
                          Verification Code
                        </label>
                        <Input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          className={`h-11 text-center text-lg tracking-widest font-mono border-2 ${
                            errors.otp ? 'border-red-500' : 'border-gray-300'
                          } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                        />
                        {errors.otp && (
                          <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('email')}
                          className="text-primary hover:underline"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-primary hover:underline disabled:text-gray-400"
                          disabled={cooldown > 0}
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          'Verify Code'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Step 3: New Password */}
                  {currentStep === 'newPassword' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Enter your new password below.
                      </div>
                      
                      {/* New Password */}
                      <div>
                        <label className="text-sm mb-1 block font-medium text-gray-700">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`pl-9 pr-9 h-11 border-2 ${
                              errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="text-sm mb-1 block font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`pl-9 pr-9 h-11 border-2 ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">Password must:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Be at least 8 characters long</li>
                          <li>Include at least one uppercase letter</li>
                          <li>Include at least one number</li>
                          <li>Include at least one special character</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border-0"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            'Save Password'
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .zoom-in {
          animation-name: zoom-in;
        }
      `}</style>
    </div>
  );
}