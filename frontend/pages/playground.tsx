import { useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import { postJson } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

const PlaygroundPage = () => {
  const { session, loading } = useAuth();
  const [note, setNote] = useState('');
  const [output, setOutput] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  const handleGenerate = async (mode: 'shitpost' | 'ragebait') => {
    if (!session) {
      setStatus('Sign in first.');
      return;
    }
    setStatus(`Cooking ${mode}…`);
    try {
      const res = await postJson<{ text: string; mode: string }, { text: string }>(
        '/playground/generate',
        { text: note, mode },
        session.access_token
      );
      setOutput(res.text);
      setStatus(null);
    } catch (err) {
      console.error(err);
      setStatus('Failed to generate.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 pb-20 pt-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AuthHeader />
        <header>
          <h1 className="text-3xl font-semibold">Playground</h1>
          <p className="text-sm text-slate-600">Shitpost / ragebait sandbox (separate from main flow).</p>
        </header>
        <textarea
          className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-[#1d9bf0] focus:outline-none"
          rows={6}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Drop any text to turn into chaos."
        />
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!session || loading}
            onClick={() => handleGenerate('shitpost')}
            className="rounded-md bg-[#1d9bf0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1583ca] disabled:opacity-60"
          >
            Shitpost
          </button>
          <button
            type="button"
            disabled={!session || loading}
            onClick={() => handleGenerate('ragebait')}
            className="rounded-md border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-500 disabled:opacity-60"
          >
            Ragebait
          </button>
        </div>
        {status && <p className="text-sm text-amber-600">{status}</p>}
        {output && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {output}
          </div>
        )}
      </div>
    </main>
  );
};

export default PlaygroundPage;
