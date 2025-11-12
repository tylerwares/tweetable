import { FormEvent, useState } from 'react';

export type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRequestLink: (email: string) => Promise<void>;
};

const AuthModal = ({ isOpen, onClose, onRequestLink }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await onRequestLink(email);
      setStatus('Check your inbox for a sign-in link.');
    } catch (error) {
      console.error('Unable to send magic link', error);
      setStatus('Unable to send link. Double-check the email and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-100">Sign in</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email to receive a magic link. Open it on this device to stay signed in.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Email address
            <input
              id="magic-email"
              name="email"
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand focus:outline-none"
              placeholder="you@example.com"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send magic link'}
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-brand"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          {status && <p className="text-sm text-slate-400">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
