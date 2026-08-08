"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Check, CheckCircle2
} from 'lucide-react';
import { authApi } from '@/lib/api';

export default function IndividualSignUpPage() {
  const router = useRouter();
  const isIndividual = true;

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
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Touched State
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Validation State
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation Effects
  useEffect(() => {
    const nameValid = name.trim().length >= 3;
    setIsNameValid(nameValid);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    setIsEmailValid(emailValid);

    const phoneRegex = /^\d{10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    setIsPhoneValid(phoneRegex.test(cleanPhone));

    const passValid = password.length >= 8;
    setIsPasswordValid(passValid);

    const confirmMatch = password === confirmPassword && confirmPassword.length > 0;
    setIsConfirmValid(confirmMatch);

    setIsFormValid(nameValid && emailValid && phoneRegex.test(cleanPhone) && passValid && confirmMatch && agreed);
  }, [name, email, phone, password, confirmPassword, agreed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    
    setLoading(true);
    setServerError('');

    try {
      // 🛑 STRICT ROLE ASSIGNMENT: Passed 'individual' to the API
      await authApi.register(name, email, password, phone.replace(/\D/g, ""), 'individual');

      // Registration returns NO token — the account is unverified and the backend
      // has emailed a 6-digit verification code. Continue to the verify step, which
      // exchanges the OTP for a login token.
      router.push(`/auth/individual/verify-email?email=${encodeURIComponent(email)}&mode=verify`);
    } catch (err) {
      // e.g. "Email already registered", weak password, rate limited
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // Determine which error to show
  const getFieldError = () => {
    if (nameTouched && !isNameValid) return { field: 'name', message: 'Name is required' };
    if (emailTouched && !isEmailValid) return { field: 'email', message: email.length > 0 ? 'Invalid email' : 'Email is required' };
    if (phoneTouched && !isPhoneValid) return { field: 'phone', message: phone.length > 0 ? 'Enter a valid 10-digit number' : 'Phone is required' };
    if (passwordTouched && !isPasswordValid) return { field: 'password', message: 'Password must be at least 8 characters' };
    if (confirmTouched && !isConfirmValid) return { field: 'confirm', message: password.length === 0 ? 'Confirm your password' : 'Passwords do not match' };
    return null;
  };

  const fieldError = getFieldError();

  const getFieldClass = (field: string, isValid: boolean) => {
    if (fieldError?.field === field) return 'border-red-400 focus-within:border-red-500';
    if (isValid) return 'border-gray-200 focus-within:border-[#449339]';
    return 'border-gray-200 focus-within:border-[#449339]';
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

      {/* Main Content Area - Expands widely on desktop */}
      <main className="relative z-10 flex-grow w-full max-w-5xl mx-auto px-6 md:px-12 lg:px-20 pt-4 md:pt-12 pb-20 flex flex-col items-center">

        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12 w-full max-w-2xl">
          <h1 className="text-[28px] md:text-4xl lg:text-5xl leading-tight font-bold text-[#1b5030] mb-3 md:mb-5 transition-all">
            Create Your Individual Account.
          </h1>
          <p className="text-[13px] md:text-base text-gray-500 font-medium leading-relaxed px-4">
            Start identifying waste, earning rewards, and helping the environment.
          </p>
        </div>

        {/* Form Container - Uses a grid on Desktop */}
        <div className="w-full bg-white md:bg-gray-50/30 md:border md:border-gray-100 md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] md:p-10 lg:p-12">

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-[#eaf4e7] rounded-full px-4 py-1.5 md:py-2 md:px-5 transition-all">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#449339]" />
              <span className="text-[13px] md:text-sm font-medium text-[#449339]">
                Signing up as an Individual
              </span>
              <Link
                href="/auth/recycler/sign-up"
                className="text-[13px] md:text-sm font-medium text-gray-500 hover:text-gray-800 ml-2 transition-colors underline-offset-2 hover:underline"
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

            {/* Responsive Grid: 1 column mobile, 2 columns desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">

              {/* Full Name */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Full Name</label>
                <div className={`relative flex items-center border rounded-2xl px-3 py-3 md:py-3.5 bg-white transition-colors ${fieldError?.field === 'name' ? 'border-red-400' : isNameValid && nameTouched ? 'border-green-500' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <User className={`w-5 h-5 mr-3 ${fieldError?.field === 'name' ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    placeholder="Maryam Abdulkarim"
                    name="name"
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  {isNameValid && nameTouched && <Check className="w-5 h-5 text-[#449339] ml-2 shrink-0" />}
                </div>
                {fieldError?.field === 'name' && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldError.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Email Address</label>
                <div className={`relative flex items-center border rounded-2xl px-3 py-3 md:py-3.5 bg-white transition-colors ${fieldError?.field === 'email' ? 'border-red-400' : isEmailValid && emailTouched ? 'border-green-500' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <Mail className={`w-5 h-5 mr-3 ${fieldError?.field === 'email' ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="mh@gmail.com"
                    name="email"
                    className="w-full outline-none text-[14px] md:text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  {isEmailValid && emailTouched && <Check className="w-5 h-5 text-[#449339] ml-2 shrink-0" />}
                </div>
                {fieldError?.field === 'email' && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldError.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Password</label>
                <div className={`relative flex items-center border rounded-2xl px-3 py-3 md:py-3.5 bg-white transition-colors ${fieldError?.field === 'password' ? 'border-red-400' : isPasswordValid && passwordTouched ? 'border-green-500' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <Lock className={`w-5 h-5 mr-3 ${fieldError?.field === 'password' ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Create a password"
                    name="password"
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
                {fieldError?.field === 'password' && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldError.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Confirm Password</label>
                <div className={`relative flex items-center border rounded-2xl px-3 py-3 md:py-3.5 bg-white transition-colors ${fieldError?.field === 'confirm' ? 'border-red-400' : isConfirmValid && confirmTouched ? 'border-green-500' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <Lock className={`w-5 h-5 mr-3 ${fieldError?.field === 'confirm' ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Confirm your password"
                    name="confirmPassword"
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
                {fieldError?.field === 'confirm' && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldError.message}
                  </p>
                )}
              </div>

              {/* Phone Number - Spans full width on desktop for visual balance */}
              <div className="md:col-span-2 md:max-w-xl md:mx-auto w-full">
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Phone Number</label>
                <div className={`relative flex items-center border rounded-2xl bg-white overflow-hidden transition-colors ${fieldError?.field === 'phone' ? 'border-red-400' : isPhoneValid && phoneTouched ? 'border-green-500' : 'border-gray-200 focus-within:border-[#449339]'}`}>
                  <div className="flex items-center gap-2 px-3 py-3 md:py-3.5 bg-white border-r border-gray-200 shrink-0">
                    <div className="w-5 h-3.5 bg-green-600 rounded-[2px] relative overflow-hidden flex">
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
                    placeholder="901 234 5678"
                    name="phone"
                    className="w-full px-3 py-3 md:py-3.5 outline-none text-[14px] md:text-[15px] text-gray-900 bg-transparent"
                  />
                  {isPhoneValid && phoneTouched && <Check className="w-5 h-5 text-[#449339] mr-3 shrink-0" />}
                  {fieldError?.field === 'phone' && <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />}
                </div>
                {fieldError?.field === 'phone' && (
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldError.message}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Form Section (Terms & Submit) */}
            <div className="mt-8 md:mt-10 max-w-xl mx-auto w-full flex flex-col items-center">

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

              {/* Dynamic Submit Button */}
              <button
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-3xl font-semibold text-[15px] md:text-base transition-all duration-300 ${
                  isFormValid && !loading
                    ? 'bg-[#449339] text-white shadow-lg shadow-green-900/20 hover:bg-[#3a7d31] hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Footer Link */}
              <div className="text-center w-full">
                <p className="text-[13px] md:text-sm text-gray-600">
                  Already have an account? <Link href="/auth/individual/sign-in" className="font-bold text-[#1b5030] hover:text-[#449339] transition-colors hover:underline underline-offset-2">Sign in</Link>
                </p>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
