import React, { useState, useRef, useEffect } from 'react';
import { Mail, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import apiService from '../../services/api';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: (userData: any | null, token: string | null) => void;
  onBackToRegistration: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBackToRegistration,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Handle cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.verifyEmail(email, otpString);
      
      if (response.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          // Check if response indicates redirect to login
          if (response.redirect_to_login) {
            onVerificationSuccess(null, null); // Pass null to indicate redirect to login
          } else {
            // Legacy: still support auto-login if token is provided
            onVerificationSuccess(response.user, response.token);
          }
        }, 1000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');
    setCanResend(false);

    try {
      const response = await apiService.resendOTP(email);
      
      if (response.success) {
        setSuccess('New verification code sent to your email');
        setResendCooldown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0]?.focus();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to resend verification code');
        setCanResend(true);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification code');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative" 
         style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
      
      <div className="max-w-md w-full z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-white/80">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-white font-semibold">{email}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/50 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-100">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {/* OTP Verification Form */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          
          {/* OTP Input Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold bg-white bg-opacity-10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-opacity-20 transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Email</span>
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-white/70 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                className="text-white hover:text-gray-200 font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!canResend && resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'
                }
              </button>
            </div>

            {/* Back to Registration */}
            <div className="text-center pt-4 border-t border-white/10">
              <button
                onClick={onBackToRegistration}
                className="text-white/70 hover:text-white font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Registration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Check your spam folder if you don't see the email.
            <br />
            The code expires in 2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;