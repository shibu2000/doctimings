import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';

export const LoginPage = () => {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <BrandLogo size={44} />
          <div>
            <p className="text-lg font-semibold text-slate-900">DocTimings</p>
            <p className="text-sm text-slate-500">Admin panel</p>
          </div>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <TextInput label="Email" type="email" autoComplete="username" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
          <TextInput label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Sign in
          </Button>
          <p className="text-xs text-slate-500 text-center">Forgot your password? Ask the super admin to reset it from Team.</p>
        </form>
      </div>
    </div>
  );
};
