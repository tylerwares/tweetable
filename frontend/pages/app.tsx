import { useEffect, useMemo, useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import NavBar from '@/components/NavBar';
import ToneSlider, { ToneKey, TONE_LABELS } from '@/components/ToneSlider';
import EditableTweet from '@/components/EditableTweet';
import UploadZone from '@/components/UploadZone';
import { useAuth } from '@/hooks/useAuth';
import { analyzeTone, generateToneTweets } from '@/utils/api';
import type { ToneProfile } from '@/types/pipeline';

const defaultTone: ToneProfile = {
  professional_casual: 50,
  polished_chaotic: 50,
  calm_enraged: 50,
  optimistic_cynical: 50,
  insightful_entertaining: 50,
  clean_profane: 50
};

const microMessages = [
  'Analyzing your voice…',
  'Finding your best ideas…',
  'Drafting your tweets…',
  'Packing extra riz…'
];

const AppPage = () => {
  const { session, loading: authLoading } = useAuth();
  const [noteContent, setNoteContent] = useState('');
  const [tone, setTone] = useState<ToneProfile>(defaultTone);
  const [baselineLoaded, setBaselineLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shortTweets, setShortTweets] = useState<string[]>([]);
  const [longTweets, setLongTweets] = useState<string[]>([]);
  const [threads, setThreads] = useState<string[][]>([]);

  useEffect(() => {
    if (!authLoading && !session) {
      window.location.replace('/login');
    }
  }, [authLoading, session]);

  const setMicroStatus = (index: number) => setStatusMessage(microMessages[index] ?? 'Working…');

  const handleUpload = async ({ text }: { text?: string }) => {
    if (!text || !session) return;
    setNoteContent(text);
    try {
      setLoading(true);
      setMicroStatus(0);
      const toneResult = await analyzeTone(text, session.access_token);
      setTone(toneResult);
      setBaselineLoaded(true);
      setStatusMessage('Voice analyzed. Adjust sliders and generate.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Voice analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (key: ToneKey, value: number) => {
    setTone((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!session) {
      setStatusMessage('Sign in to generate.');
      return;
    }
    if (!noteContent.trim()) {
      setStatusMessage('Add some notes first.');
      return;
    }
    setLoading(true);
    setMicroStatus(2);
    try {
      const res = await generateToneTweets(noteContent, tone, session.access_token);
      setShortTweets(res.short_tweets.slice(0, 4));
      setLongTweets(res.long_tweets.slice(0, 4));
      setThreads(res.threads.slice(0, 2));
      setStatusMessage('Tweets ready. Edit or regenerate as needed.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateSlot = async (section: 'short' | 'long' | 'thread', index: number) => {
    if (!session || !noteContent.trim()) return;
    setLoading(true);
    setStatusMessage('Regenerating that tweet…');
    try {
      const res = await generateToneTweets(noteContent, tone, session.access_token);
      if (section === 'short') {
        const next = [...shortTweets];
        next[index] = res.short_tweets[index] ?? res.short_tweets[0] ?? '';
        setShortTweets(next);
      } else if (section === 'long') {
        const next = [...longTweets];
        next[index] = res.long_tweets[index] ?? res.long_tweets[0] ?? '';
        setLongTweets(next);
      } else {
        const next = [...threads];
        next[index] = res.threads[index] ?? res.threads[0] ?? [];
        setThreads(next);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Regeneration failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateThreadTweet = (threadIdx: number, tweetIdx: number, value: string) => {
    setThreads((prev) => {
      const copy = prev.map((t) => [...t]);
      if (copy[threadIdx]) copy[threadIdx][tweetIdx] = value;
      return copy;
    });
  };

  const addTweetToThread = (threadIdx: number) => {
    setThreads((prev) => {
      const copy = prev.map((t) => [...t]);
      if (copy[threadIdx]) copy[threadIdx].push('');
      return copy;
    });
  };

  const deleteTweetFromThread = (threadIdx: number, tweetIdx: number) => {
    setThreads((prev) => {
      const copy = prev.map((t) => [...t]);
      if (copy[threadIdx]) copy[threadIdx].splice(tweetIdx, 1);
      return copy;
    });
  };

  const privacyBadge = (
    <div className="mt-8 text-center text-xs text-slate-500">
      We never store your notes. Files are processed in-memory and immediately discarded.
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-20 pt-10">
        <AuthHeader />
        {statusMessage && (
          <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {statusMessage}
          </div>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h1 className="text-3xl font-semibold">Tweetable</h1>
          <p className="text-sm text-slate-400">Paste notes → analyze voice → adjust tone → generate.</p>
          <div className="mt-4">
            <UploadZone onUpload={handleUpload} />
          </div>
          {baselineLoaded && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">Tone sliders</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {(Object.keys(TONE_LABELS) as ToneKey[]).map((key) => (
                  <ToneSlider key={key} toneKey={key} value={tone[key]} onChange={handleToneChange} />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || authLoading || !session}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white disabled:opacity-50"
                >
                  {loading ? 'Working…' : 'Regenerate with new tone'}
                </button>
              </div>
            </div>
          )}
        </section>

        {shortTweets.length > 0 || longTweets.length > 0 || threads.length > 0 ? (
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold">Short tweets (4)</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {shortTweets.map((tweet, idx) => (
                  <EditableTweet
                    key={`short-${idx}`}
                    label={`Short ${idx + 1}`}
                    initialText={tweet}
                    onChange={(txt) => {
                      const next = [...shortTweets];
                      next[idx] = txt;
                      setShortTweets(next);
                    }}
                    onRegenerate={() => regenerateSlot('short', idx)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Long tweets (4)</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {longTweets.map((tweet, idx) => (
                  <EditableTweet
                    key={`long-${idx}`}
                    label={`Long ${idx + 1}`}
                    initialText={tweet}
                    onChange={(txt) => {
                      const next = [...longTweets];
                      next[idx] = txt;
                      setLongTweets(next);
                    }}
                    onRegenerate={() => regenerateSlot('long', idx)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Threads (2)</h2>
              <div className="mt-3 space-y-4">
                {threads.map((thread, threadIdx) => (
                  <div key={`thread-${threadIdx}`} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Thread {threadIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => regenerateSlot('thread', threadIdx)}
                        className="rounded-md border border-brand/60 bg-brand/10 px-3 py-1 text-xs font-semibold text-amber-100 hover:border-brand"
                        disabled={loading}
                      >
                        Regenerate thread
                      </button>
                    </div>
                    {thread.map((tweet, tweetIdx) => (
                      <div key={`tw-${threadIdx}-${tweetIdx}`} className="rounded border border-slate-800 bg-slate-950/70 p-2">
                        <textarea
                          className="w-full rounded-md bg-transparent text-sm text-slate-100 outline-none"
                          rows={2}
                          value={tweet}
                          onChange={(e) => updateThreadTweet(threadIdx, tweetIdx, e.target.value)}
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                          <span className={tweet.length >= 270 ? 'text-amber-300' : ''}>{tweet.length} chars</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(tweet)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:border-brand"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTweetFromThread(threadIdx, tweetIdx)}
                              className="rounded-md border border-red-700 px-2 py-1 text-[11px] font-semibold text-red-300 hover:border-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTweetToThread(threadIdx)}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-brand"
                    >
                      Add tweet
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {privacyBadge}
      </div>
    </main>
  );
};

export default AppPage;
