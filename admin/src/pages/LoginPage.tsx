import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, X, ArrowRight, Shield } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin.ops@docnear.org');
  const [password, setPassword] = useState('HealthcareSecure2025');
  const [showPassword, setShowPassword] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Email or password is incorrect.');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isBackendConnected } = useAdmin();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorBannerVisible(false);
    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.error || 'Email or password is incorrect.');
        setErrorBannerVisible(true);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Cannot reach DocTimings backend server.');
      setErrorBannerVisible(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200">
        <div className="h-16 w-full max-w-[1600px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} className="shrink-0 shadow-sm rounded-lg" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-teal-800 leading-tight tracking-tight">
                DocTimings
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Governance & Verification Portal
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
            isBackendConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span>{isBackendConnected ? 'Backend Live' : 'Backend Offline'}</span>
          </div>
        </div>
      </header>

      <main className="w-full pt-28 flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-[440px] flex flex-col items-center">
          <div className="w-full flex flex-col items-center mb-6 text-center">
            <div className="relative mb-3">
              <BrandLogo size={56} className="shadow-md rounded-2xl" />
              <span className="absolute -bottom-1 -right-2 px-2 py-0.5 rounded-full bg-teal-700 text-white font-mono text-[10px] font-bold tracking-wider">
                OPS
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-teal-800 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Internal Operations & Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DocTimings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Healthcare Information Management System</p>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to manage verified healthcare data.</p>
            </div>

            {errorBannerVisible && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-red-800">{errorMessage}</p>
                  <p className="text-red-700/90 mt-0.5">Ensure your credentials are valid and the DocTimings backend server is running.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorBannerVisible(false)}
                  className="text-red-500 hover:text-red-800 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter admin email"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4 text-slate-400" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Checkbox
                  defaultChecked
                  label="Keep me signed in"
                />
                <span className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign in to OPS Portal
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">Restricted platform access.</strong> Authorized administrative credentials required for healthcare data verification, clinic audit logs, and directory operations.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              TLS Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              Role-Based Access
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">v3.4.1</span>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-slate-200 py-3">
        <div className="w-full max-w-[1600px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">DocTimings</span>
            <span>•</span>
            <span>Healthcare Information Management System</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-teal-700 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-teal-700 cursor-pointer">Audit Protocol</span>
            <span className="hover:text-teal-700 cursor-pointer">Verification Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
