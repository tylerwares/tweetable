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
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">Tweetable.app</p>
        <p className="text-xs text-slate-500">{userEmail ? `Signed in as ${userEmail}` : 'Sign in to generate & save drafts'}</p>
      </div>
      <div className="flex items-center gap-2">
        <UpgradeButton />
        {userEmail ? (
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#1d9bf0]"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={openModal}
            className="rounded-md bg-[#1d9bf0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1583ca] disabled:opacity-60"
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
      className="rounded-md border border-[#1d9bf0]/50 bg-[#1d9bf0]/10 px-3 py-2 text-xs font-semibold text-[#0b4778] hover:border-[#1d9bf0] disabled:opacity-60"
      title={session ? 'Upgrade to Pro' : 'Sign in to upgrade'}
    >
      {loading ? 'Redirecting…' : 'Upgrade to Pro'}
    </button>
  );
};
