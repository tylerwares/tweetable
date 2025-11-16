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
  const [shortTweets, setShortTweets] = useState<string[]>(['', '', '', '']);
  const [longTweets, setLongTweets] = useState<string[]>(['', '', '', '']);
  const [threads, setThreads] = useState<string[][]>([
    ['', '', ''],
    ['', '', '']
  ]);

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
      const normalizedShort = [...res.short_tweets.slice(0, 4)];
      while (normalizedShort.length < 4) normalizedShort.push('');
      const normalizedLong = [...res.long_tweets.slice(0, 4)];
      while (normalizedLong.length < 4) normalizedLong.push('');
      const normalizedThreads = [...res.threads.slice(0, 2)];
      while (normalizedThreads.length < 2) normalizedThreads.push(['', '', '']);
      normalizedThreads.forEach((t, idx) => {
        if (t.length < 3) normalizedThreads[idx] = [...t, '', ''];
      });
      setShortTweets(normalizedShort);
      setLongTweets(normalizedLong);
      setThreads(normalizedThreads);
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
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <NavBar />
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 pb-20 pt-10">
        <aside className="sticky top-4 h-fit w-full max-w-sm">
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <AuthHeader />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Tweetable</h1>
            <p className="text-sm text-slate-500">Paste notes → analyze voice → adjust tone → generate.</p>
            <div className="mt-4">
              <UploadZone onUpload={handleUpload} />
            </div>

            {statusMessage && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {statusMessage}
              </div>
            )}

            {baselineLoaded && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Tone sliders</h3>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || authLoading || !session}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Working…' : 'Apply tone & generate'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(TONE_LABELS) as ToneKey[]).map((key) => (
                    <ToneSlider key={key} toneKey={key} value={tone[key]} onChange={handleToneChange} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
            We never store your notes. Files are processed in-memory and immediately discarded.
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Short tweets (4)</h2>
            <p className="text-xs text-slate-500">Under 100 characters each.</p>
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

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Long tweets (4)</h2>
            <p className="text-xs text-slate-500">100–280 characters.</p>
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

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Threads (2)</h2>
            <p className="text-xs text-slate-500">Each thread has 3–5 tweets.</p>
            <div className="mt-3 space-y-4">
              {threads.map((thread, threadIdx) => (
                <div key={`thread-${threadIdx}`} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Thread {threadIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => regenerateSlot('thread', threadIdx)}
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:border-blue-300"
                      disabled={loading}
                    >
                      Regenerate thread
                    </button>
                  </div>
                  {thread.map((tweet, tweetIdx) => (
                    <div key={`tw-${threadIdx}-${tweetIdx}`} className="rounded border border-slate-200 bg-white p-2">
                      <textarea
                        className="w-full rounded-md bg-transparent text-sm text-slate-900 outline-none"
                        rows={2}
                        value={tweet}
                        onChange={(e) => updateThreadTweet(threadIdx, tweetIdx, e.target.value)}
                      />
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span className={tweet.length >= 270 ? 'text-amber-500' : ''}>{tweet.length} chars</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(tweet)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTweetFromThread(threadIdx, tweetIdx)}
                            className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-600 hover:border-red-300"
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300"
                  >
                    Add tweet
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AppPage;
