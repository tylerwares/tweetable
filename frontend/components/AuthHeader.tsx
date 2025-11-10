import { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

const AuthHeader = () => {
  const { session, loading, signInWithEmail, signOut } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const userEmail = session?.user.email;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-100">Tweetable.app</p>
        <p className="text-xs text-slate-400">{userEmail ? `Signed in as ${userEmail}` : 'Sign in to generate & save drafts'}</p>
      </div>
      <div className="flex items-center gap-2">
        <UpgradeButton />
        {userEmail ? (
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-brand"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={openModal}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Sign in'}
          </button>
        )}
      </div>
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onRequestLink={async (email) => {
          await signInWithEmail(email);
          closeModal();
        }}
      />
    </header>
  );
};

export default AuthHeader;

const UpgradeButton = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    try {
      setLoading(true);
      const token = session?.access_token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL}/billing/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ user_id: session?.user.id, email: session?.user.email })
        }
      );
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (e) {
      console.error('Checkout init failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={!session || loading}
      className="rounded-md border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:border-amber-400 disabled:opacity-60"
      title={session ? 'Upgrade to Pro' : 'Sign in to upgrade'}
    >
      {loading ? 'Redirecting…' : 'Upgrade to Pro'}
    </button>
  );
};
