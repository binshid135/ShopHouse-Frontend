"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ChefHat, Mail } from 'lucide-react';
import FloatingElements from '../components/FloatingElements';
import Header from '../components/Header';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [otpSent, setOtpSent] = useState(false);

  // UAE phone number validation
  const validateUAEPhone = (phone: string): boolean => {
    // Remove any spaces, dashes, or parentheses
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // UAE phone number patterns:
    // - Starts with +971 or 971 followed by 9 digits
    // - Starts with 05 followed by 8 digits
    // - Starts with 5 followed by 8 digits (without 0)
    const uaePhoneRegex = /^(?:\+971|971|0)?5[0-9]{8}$/;
    
    return uaePhoneRegex.test(cleanedPhone);
  };

  const formatUAEPhone = (phone: string): string => {
    // Remove any non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with 05, convert to +9715
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      return `+971${cleaned.slice(1)}`;
    }
    
    // If it starts with 5 (without 0) and has 9 digits, add +971
    if (cleaned.startsWith('5') && cleaned.length === 9 && !cleaned.startsWith('+')) {
      return `+971${cleaned}`;
    }
    
    // If it starts with 971 and has 12 digits, add +
    if (cleaned.startsWith('971') && cleaned.length === 12 && !cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Allow only numbers, +, and common separators
      const phoneValue = value.replace(/[^\d+\-\s\(\)]/g, '');
      setFormData({ ...formData, [name]: phoneValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setError('');
  };

  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  const sendOtp = async () => {
    try {
      // Validate UAE phone number if provided
      if (formData.phone && !validateUAEPhone(formData.phone)) {
        setError('Please enter a valid UAE phone number (e.g., 05XXXXXXXX or +9715XXXXXXXX)');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          // Send formatted phone number to backend
          phone: formData.phone ? formatUAEPhone(formData.phone) : null 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // In your handleSubmit function, update the OTP verification part:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validation
  if (step === 1) {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate UAE phone number if provided
    if (formData.phone && !validateUAEPhone(formData.phone)) {
      setError('Please enter a valid UAE phone number (e.g., 05XXXXXXXX or +9715XXXXXXXX)');
      setLoading(false);
      return;
    }

    await sendOtp();
    return;
  }

  // Step 2: Verify OTP and complete signup
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone ? formatUAEPhone(formData.phone) : null,
        otp: formData.otp,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ SUCCESS CODE with cart migration
      console.log('✅ Signup successful:', data.user);
      
      // Get guest cart ID before migration
      const guestCartId = getCookie('cartId');
      console.log("🔍 Guest cart ID for migration:", guestCartId);
      
      if (guestCartId) {
        try {
          console.log('🔄 Starting cart migration after signup...');
          
          // Wait a bit for the session to be fully established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const migrateResponse = await fetch('/api/userside/cart/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ guestCartId }),
          });
          
          if (migrateResponse.ok) {
            const migrateData = await migrateResponse.json();
            console.log('✅ Cart migration successful after signup:', migrateData);
          } else {
            const errorData = await migrateResponse.json();
            console.warn('⚠️ Cart migration failed after signup:', errorData);
          }
        } catch (migrateError) {
          console.error('❌ Cart migration error after signup:', migrateError);
          // Don't block the signup process
        }
      }
      
      router.push('/products');
      router.refresh();
      
    } else {
      // Handle specific error cases
      if (data.error?.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.');
        // Optionally reset the form or redirect to login
        setStep(1);
      } else if (data.error?.includes('OTP')) {
        setError(data.error);
      } else {
        setError(data.error || 'Signup failed');
      }
    }
  } catch (error) {
    setError('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};
  // Helper function to show phone validation hint
  const getPhoneValidationHint = () => {
    if (!formData.phone) return 'Enter your UAE phone number (optional)';
    
    if (validateUAEPhone(formData.phone)) {
      return '✓ Valid UAE number';
    } else {
      return 'Please enter a valid UAE number (05XXXXXXXX or +9715XXXXXXXX)';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  Shop House
                </span>
              </div>
              <h1 className="text-3xl font-bold text-amber-900">
                {step === 1 ? 'Create Account' : 'Verify Email'}
              </h1>
              <p className="text-amber-700 mt-2">
                {step === 1 ? 'Join Shop House today' : `Enter OTP sent to ${formData.email}`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Phone Number (UAE)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50 ${
                        formData.phone 
                          ? validateUAEPhone(formData.phone) 
                            ? 'border-green-400' 
                            : 'border-red-300'
                          : 'border-amber-200'
                      }`}
                      placeholder="e.g., 05XXXXXXXX or +9715XXXXXXXX"
                    />
                    <p className={`text-xs mt-1 ${
                      formData.phone 
                        ? validateUAEPhone(formData.phone) 
                          ? 'text-green-600' 
                          : 'text-red-600'
                        : 'text-amber-600'
                    }`}>
                      {getPhoneValidationHint()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50 pr-12"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50 pr-12"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Enter OTP *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50 pr-12"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    {otpSent ? 'OTP sent successfully!' : 'Sending OTP...'}
                  </p>
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="text-sm text-orange-600 hover:text-orange-700 mt-2"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <UserPlus className="w-5 h-5" />
                {loading 
                  ? (step === 1 ? 'Sending OTP...' : 'Creating Account...')
                  : (step === 1 ? 'Send OTP' : 'Verify & Create Account')
                }
              </button>

              {step === 1 && (
                <div className="text-center">
                  <p className="text-amber-700">
                    Already have an account?{' '}
                    <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-amber-600 hover:text-amber-700 font-medium py-2"
                >
                  ← Back to edit details
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}