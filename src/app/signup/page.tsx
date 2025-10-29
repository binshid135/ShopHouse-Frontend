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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      setLoading(true);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
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
          phone: formData.phone,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
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
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                      placeholder="Enter your phone number"
                    />
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