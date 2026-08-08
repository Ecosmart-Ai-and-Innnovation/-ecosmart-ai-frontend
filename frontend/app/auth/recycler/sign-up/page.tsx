"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Check, CheckCircle2
} from 'lucide-react';
import { authApi } from '@/lib/api';

export default function RecyclerSignUpPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const [serverError, setServerError] = useState('');

  // Field Validation States
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Password Strength States
  const [hasLength, setHasLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasNumberOrSpecial, setHasNumberOrSpecial] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);

  // Overall Form Validation
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time Validation Effect
  useEffect(() => {
    const nameValid = name.trim().length >= 3;
    setIsNameValid(nameValid);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    setIsEmailValid(emailValid);

    const phoneRegex = /^\d{10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneValid = phoneRegex.test(cleanPhone);
    setIsPhoneValid(phoneValid);

    const lengthValid = password.length >= 8;
    const upperValid = /[A-Z]/.test(password);
    const numOrSpecialValid = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

    setHasLength(lengthValid);
    setHasUpper(upperValid);
    setHasNumberOrSpecial(numOrSpecialValid);

    const passValid = lengthValid && upperValid && numOrSpecialValid;
    setIsPasswordValid(passValid);

    const confirmMatch = password === confirmPassword && confirmPassword.length > 0;
    setIsConfirmValid(confirmMatch);

    setIsFormValid(nameValid && emailValid && phoneValid && passValid && confirmMatch && agreed);
  }, [name, email, phone, password, confirmPassword, agreed]);

  // Password Strength Score (0 to 4)
  const getStrengthScore = () => {
    if (password.length === 0) return 0;
    let score = 1;
    if (hasLength) score += 1;
    if (hasUpper) score += 1;
    if (hasNumberOrSpecial) score += 1;
    return score;
  };

  const score = getStrengthScore();

  const getStrengthDisplay = () => {
    if (score === 0) return { text: '', color: 'bg-gray-200', textColor: '' };
    if (score <= 2) return { text: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 3) return { text: 'Fair', color: 'bg-amber-400', textColor: 'text-amber-500' };
    return { text: 'Strong', color: 'bg-[#549B45]', textColor: 'text-[#549B45]' };
  };

  const strength = getStrengthDisplay();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    
    setLoading(true);
    setServerError('');

    try {
      // 🛑 STRICT ROLE ASSIGNMENT: Passed 'recycler' to the API
      await authApi.register(name, email, password, phone.replace(/\D/g, ""), 'recycler');

      // Registration returns NO token — the account is unverified and the backend
      // has emailed a 6-digit verification code. Verify the email to obtain a login
      // token; the verify step then routes on to build-profile.
      router.push(`/auth/recycler/verify-email?email=${encodeURIComponent(email)}&mode=verify`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-hidden">

      {/* Edge-to-Edge Decorative Top Wave */}
      <div className="absolute top-0 left-0 w-full h-56 md:h-72 lg:h-80 bg-[#f6fcf4] z-0">
         <svg
           viewBox="0 0 1200 120"
           preserveAspectRatio="none"
           className="absolute bottom-0 w-full h-12 md:h-20 lg:h-24 block"
           fill="#ffffff"
         >
           <path d="M0,120 L1200,120 L1200,0 Q600,140 0,0 Z" />
         </svg>
      </div>

      {/* Header */}
      <header className="relative z-20 w-full flex justify-end px-6 md:px-12 lg:px-24 pt-6 pb-4">
        <button className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer shadow-sm">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">English</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-20 pt-4 md:pt-12 pb-20 flex flex-col items-center">

        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12 w-full max-w-2xl">
          <h1 className="text-[28px] md:text-4xl lg:text-5xl leading-tight font-bold text-[#1b5030] mb-3 md:mb-5 transition-all">
            Create Your Recycler Account.
          </h1>
          <p className="text-[13px] md:text-base text-gray-500 font-medium leading-relaxed px-4">
            Start accepting recycling requests and grow your business with EcoSmart AI.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white md:bg-gray-50/30 md:border md:border-gray-100 md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] md:p-10 lg:p-12">

          {/* Status Badge */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-2 bg-[#eaf4e7] rounded-full px-4 py-1.5 md:py-2 md:px-5 transition-all">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#449339]" />
              <span className="text-[13px] md:text-sm font-medium text-[#449339]">
                Signing up as a Recycler
              </span>
              <Link
                href="/auth/individual/sign-up"
                className="text-[13px] md:text-sm font-medium text-gray-500 hover:text-[#1b5030] ml-2 transition-colors underline-offset-2 hover:underline"
              >
                Change
              </Link>
            </div>
          </div>

          <form className="w-full" onSubmit={handleSubmit}>
            {serverError && (
              <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[13px] md:text-sm text-red-600 font-medium">{serverError}</p>
              </div>
            )}

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* Business Name */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-800 mb-1.5 md:mb-2">
                  Business Name
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white focus-within:border-[#449339] transition-colors shadow-sm">
                  <User className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    name="name" placeholder="Eco Waste Ltd."
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  {isNameValid && <Check className="w-5 h-5 text-[#449339] ml-2 shrink-0 animate-in zoom-in" />}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-800 mb-1.5 md:mb-2">Email Address</label>
                <div className="relative flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white focus-within:border-[#449339] transition-colors shadow-sm">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email" placeholder="example@mail.com"
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  {isEmailValid && <Check className="w-5 h-5 text-[#449339] ml-2 shrink-0 animate-in zoom-in" />}
                </div>
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2 w-full">
                <label className="block text-[13px] md:text-sm font-medium text-gray-800 mb-1.5 md:mb-2">Phone Number</label>
                <div className={`relative flex items-center border rounded-2xl bg-white overflow-hidden transition-colors shadow-sm ${!isPhoneValid && phoneTouched ? 'border-red-400' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-r border-gray-200 shrink-0">
                    <div className="w-5 h-3.5 bg-green-600 rounded-[2px] relative overflow-hidden flex shadow-sm">
                      <div className="w-1/3 h-full bg-green-600"></div>
                      <div className="w-1/3 h-full bg-white"></div>
                      <div className="w-1/3 h-full bg-green-600"></div>
                    </div>
                    <span className="text-[14px] md:text-[15px] font-medium text-gray-700">+234</span>
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneTouched(true);
                    }}
                    name="phone" placeholder="901 234 5678"
                    className="w-full px-4 py-3.5 outline-none text-[14px] md:text-[15px] text-gray-900 bg-transparent"
                  />
                  {isPhoneValid && <Check className="w-5 h-5 text-[#449339] mr-4 shrink-0 animate-in zoom-in" />}
                  {!isPhoneValid && phoneTouched && (
                    <AlertCircle className="w-5 h-5 text-red-500 mr-4 shrink-0" />
                  )}
                </div>
                {!isPhoneValid && phoneTouched && phone.length > 0 && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Enter a valid 10-digit Nigerian phone number
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-800 mb-1.5 md:mb-2">Password</label>
                <div className="relative flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white focus-within:border-[#449339] transition-colors shadow-sm">
                  <Lock className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password" placeholder="Create a password"
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer shrink-0"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="w-full mt-1 px-1">
                  <div className="flex gap-1 mb-1.5 h-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          score >= bar ? strength.color : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  {password.length > 0 && (
                    <p className={`text-[12px] font-bold transition-colors ${strength.textColor}`}>
                      {strength.text}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    At least 8 characters, one uppercase, one number or special character.
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-800 mb-1.5 md:mb-2">Confirm Password</label>
                <div className="relative flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white focus-within:border-[#449339] transition-colors shadow-sm">
                  <Lock className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    name="password" placeholder="Confirm your password"
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer shrink-0"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Section */}
            <div className="mt-10 md:mt-12 max-w-2xl mx-auto w-full flex flex-col items-center">

              {/* Terms Checkbox */}
              <div className="flex items-start md:items-center justify-center gap-3 mb-6 w-full">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer mt-0.5 md:mt-0 shrink-0 transition-colors ${agreed ? 'bg-[#449339] border-[#449339]' : 'border-gray-300'}`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </div>
                <p className="text-[13px] md:text-sm text-gray-700 leading-snug">
                  I agree to the <span className="font-semibold text-[#1b5030]">Terms &amp; Conditions</span> and <span className="font-semibold text-[#1b5030]">Privacy Policy</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-full font-semibold text-[15px] md:text-[16px] transition-all duration-300 ${
                  isFormValid && !loading
                    ? 'bg-[#549B45] text-white shadow-lg shadow-green-900/20 hover:bg-[#458237] hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Footer Link */}
              <div className="text-center w-full mt-8">
                <p className="text-[13px] md:text-sm text-gray-600">
                  Already have an account? <Link href="/auth/recycler/sign-in" className="font-bold text-[#1b5030] hover:text-[#449339] transition-colors hover:underline underline-offset-2">Sign in</Link>
                </p>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
