import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ArrowRight,
  Shield,
  CalendarClock,
  Building2,
  ShieldCheck,
  Activity,
  ExternalLink,
  KeyRound
} from 'lucide-react';
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

  const handleApplyPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorBannerVisible(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#F8FAFC] select-none">
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] h-full bg-gradient-to-br from-[#042F2E] via-[#0F766E] to-[#115E59] p-8 xl:p-12 flex-col justify-between text-white relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={40} className="shrink-0 shadow-lg rounded-xl" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">DocTimings</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  OPS PORTAL
                </span>
              </div>
              <span className="text-[11px] text-teal-200/70 tracking-wide font-medium">
                Governance & Verification
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-teal-200 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5 text-teal-300" />
              <span>Administrative Command Desk</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Doctor Chamber Timings & Clinic Network Control
            </h1>
            <p className="text-xs xl:text-sm text-teal-100/80 mt-2 leading-relaxed">
              Verify visiting specialists, broadcast real-time delay notices, and audit clinic token rosters across West Bengal and Pan-India health corridors.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-200 shrink-0">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Live Chamber Overrides</h2>
                <p className="text-[11px] text-teal-100/70 mt-0.5">
                  Instant delay broadcasts and single-date cancellations update patients in real time.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-200 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Clinic & Pharmacy Verification</h2>
                <p className="text-[11px] text-teal-100/70 mt-0.5">
                  Validate government trade licenses and counter token distribution policies.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-200 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Tamper-Proof Audit Logging</h2>
                <p className="text-[11px] text-teal-100/70 mt-0.5">
                  Immutable record of every schedule adjustment, user role update, and listing change.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-200/70">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Neon Postgres v16 • Cloudflare Edge</span>
          </div>
          <span>v3.4.1 Production</span>
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col justify-between p-5 sm:p-8 lg:p-10 xl:p-12 overflow-hidden bg-white/80 backdrop-blur-md">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandLogo size={32} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-none">DocTimings</span>
              <span className="text-[10px] text-teal-700 font-semibold mt-0.5">OPS PORTAL</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <a
              href="https://doctimings.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              <span>Public Patient Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isBackendConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isBackendConnected ? 'Backend Live' : 'Backend Offline'}</span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your verified administrative credentials to access the governance panel.
            </p>
          </div>

          {errorBannerVisible && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-rose-700/90 mt-0.5">Ensure your credentials are valid and the backend server is reachable.</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorBannerVisible(false)}
                className="text-rose-500 hover:text-rose-800 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <Input
              label="Administrative Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@doctimings.com"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
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

            <div className="flex items-center justify-between pt-0.5">
              <Checkbox defaultChecked label="Keep signed in for 7 days" />
              <button
                type="button"
                onClick={() => alert('Password reset links must be authorized by the Super Admin.')}
                className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
              >
                Need help?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-1.5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Command Portal
            </Button>
          </form>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                Quick Auth Presets
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('admin.ops@docnear.org', 'HealthcareSecure2025')}
                className="p-1.5 text-left rounded-lg bg-white border border-slate-200 hover:border-teal-600 text-[11px] text-slate-700 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Ops Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin.ops@docnear.org</div>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('admin@docnear.internal', 'password123')}
                className="p-1.5 text-left rounded-lg bg-white border border-slate-200 hover:border-teal-600 text-[11px] text-slate-700 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@docnear.internal</div>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span className="font-medium text-slate-600">Restricted Operational Panel</span>
            <span>•</span>
            <span>Zero-Trust Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>TLS 256-Bit</span>
            <span>Audit Monitored</span>
          </div>
        </div>
      </div>
    </div>
  );
};
