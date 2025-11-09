import { useEffect, useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import DraftCard from '@/components/DraftCard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/utils/useSupabase';

type Draft = {
  id: string;
  content: string;
  persona: string;
  created_at?: string;
};

const DraftsPage = () => {
  const supabase = useSupabase();
  const { session } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const loadDrafts = async () => {
      if (!supabase || !session) {
        return;
      }

      const { data } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false });
      setDrafts(data ?? []);
    };

    void loadDrafts();
  }, [supabase, session]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-16 pt-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <AuthHeader />
        {!session && (
          <p className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 text-sm text-slate-400">
            Sign in to see drafts you have saved.
          </p>
        )}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Your drafts</h1>
          <p className="text-sm text-slate-400">
            Access saved tweets on mobile or desktop. Copy with a single tap.
          </p>
        </header>

        {session && (
          <section className="grid gap-3">
            {drafts.length === 0 ? (
              <p className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 text-sm text-slate-400">
                Saved drafts will appear here after you generate and save them.
              </p>
            ) : (
              drafts.map((draft) => (
                <DraftCard key={draft.id} content={draft.content} variant="long" />
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default DraftsPage;
