import { useEffect, useMemo, useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import GenerationResults, { GenerationResponse } from '@/components/GenerationResults';
import UploadZone from '@/components/UploadZone';
import { useAuth } from '@/hooks/useAuth';
import { regenerateStage, runPipeline } from '@/utils/api';
import { useSupabase } from '@/utils/useSupabase';
import type {
  IdeaItem,
  InsightAngle,
  StageLiteral,
  TweetOutput,
  VoiceProfile
} from '@/types/pipeline';

const AppPage = () => {
  const [noteContent, setNoteContent] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [angles, setAngles] = useState<InsightAngle[]>([]);
  const [tweets, setTweets] = useState<TweetOutput | null>(null);
  const [shitpost, setShitpost] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<StageLiteral | 'run' | null>(null);
  const supabase = useSupabase();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !session) {
      window.location.replace('/login');
    }
  }, [authLoading, session]);

  useEffect(() => {
    if (session && statusMessage) {
      setStatusMessage(null);
    }
  }, [session, statusMessage]);

  const generationResults = useMemo<GenerationResponse | undefined>(() => {
    if (!tweets) return undefined;
    return {
      short_tweets: tweets.short_tweet ? [tweets.short_tweet] : [],
      long_tweets: tweets.tweets ?? [],
      threads: tweets.threads ?? []
    };
  }, [tweets]);

  const handleSaveDraft = async (content: string) => {
    if (!supabase || !session) {
      setStatusMessage('Sign in to save drafts to your Supabase account.');
      return;
    }

    try {
      await supabase.from('drafts').insert({ content, persona: voiceProfile?.persona ?? 'builder' });
    } catch (error) {
      console.error('Saving draft failed', error);
    }
  };

  const ensureNotes = () => {
    if (!noteContent.trim()) {
      setStatusMessage('Add some notes before running the pipeline.');
      return false;
    }
    return true;
  };

  const handleRunPipeline = async () => {
    if (!session) {
      setStatusMessage('Sign in to generate.');
      return;
    }
    if (!ensureNotes()) return;

    setLoadingStage('run');
    try {
      const token = session.access_token;
      const response = await runPipeline(
        { note_text: noteContent, include_shitpost: true, session_id: sessionId ?? undefined },
        token
      );
      setSessionId(response.session_id);
      setVoiceProfile(response.voice_profile);
      setIdeas(response.ideas.ideas);
      setAngles(response.angles.angles);
      setTweets(response.tweets);
      setShitpost(response.shitpost?.shitpost ?? null);
    } catch (error) {
      console.error('Pipeline run failed', error);
      setStatusMessage('Pipeline run failed. Please try again.');
    } finally {
      setLoadingStage(null);
    }
  };

  const handleStageRegeneration = async (stage: StageLiteral) => {
    if (!session) {
      setStatusMessage('Sign in first.');
      return;
    }

    const payload: any = { session_id: sessionId ?? undefined };
    if (stage === 'voice' || stage === 'ideas') {
      if (!ensureNotes()) return;
      payload.note_text = noteContent;
    }
    if (stage !== 'voice') {
      if (!voiceProfile) {
        setStatusMessage('Run or regenerate voice first.');
        return;
      }
      payload.voice_profile = voiceProfile;
    }
    if (stage === 'angles' || stage === 'tweets' || stage === 'shitpost') {
      if (!ideas.length && stage === 'angles') {
        setStatusMessage('Generate ideas first.');
        return;
      }
      if (stage === 'tweets' || stage === 'shitpost') {
        if (!angles.length) {
          setStatusMessage('Generate angles first.');
          return;
        }
        payload.angles = { angles };
      }
      if (stage === 'angles') {
        payload.ideas = { ideas };
      }
    }

    setLoadingStage(stage);
    try {
      const token = session.access_token;
      const response = await regenerateStage(stage, payload, token);
      setSessionId(response.session_id);
      if (response.voice_profile) setVoiceProfile(response.voice_profile);
      if (response.ideas) setIdeas(response.ideas.ideas);
      if (response.angles) setAngles(response.angles.angles);
      if (response.tweets) setTweets(response.tweets);
      if (response.shitpost) setShitpost(response.shitpost.shitpost);
    } catch (error) {
      console.error('Stage regeneration failed', error);
      setStatusMessage(`Failed to regenerate ${stage}.`);
    } finally {
      setLoadingStage(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <AuthHeader />
        {statusMessage && (
          <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full space-y-6 lg:max-w-sm">
          <h1 className="text-3xl font-semibold">Pipeline</h1>
          <UploadZone onUpload={({ text }) => setNoteContent(text ?? '')} />
          <button
            type="button"
            onClick={handleRunPipeline}
            className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!!loadingStage || !session || authLoading}
          >
            {loadingStage === 'run' ? 'Running pipeline…' : session ? 'Run pipeline' : 'Sign in to generate'}
          </button>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['voice', 'ideas', 'angles', 'tweets', 'shitpost'] as StageLiteral[]).map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => handleStageRegeneration(stage)}
                disabled={!!loadingStage || !session}
                className="rounded-md border border-slate-700 px-3 py-2 font-semibold text-slate-200 transition hover:border-brand disabled:opacity-50"
              >
                {loadingStage === stage ? `Regenerating ${stage}…` : `Regenerate ${stage}`}
              </button>
            ))}
          </div>
        </section>

        <section className="w-full flex-1 space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-slate-50">Outputs</h2>
            <p className="text-sm text-slate-400">Run the pipeline to populate each stage. Regenerate as needed.</p>
          </header>

          {voiceProfile && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold">Voice profile</h3>
              <p className="mt-2 text-slate-200">{voiceProfile.voice_profile}</p>
              <p className="mt-1 text-sm text-slate-400">Persona: {voiceProfile.persona}</p>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                {voiceProfile.stylistic_quirks.map((q) => (
                  <li key={q} className="rounded border border-slate-700 px-2 py-1">{q}</li>
                ))}
              </ul>
            </div>
          )}

          {ideas.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold">Ideas</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {ideas.map((idea) => (
                  <div key={idea.title} className="rounded border border-slate-800 bg-slate-950/60 p-3">
                    <p className="font-semibold text-slate-100">{idea.title}</p>
                    <p className="text-sm text-slate-300">{idea.summary}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Virality {idea.virality} • Relatability {idea.relatability} • Punch {idea.emotional_punch}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {angles.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold">Insight angles</h3>
              <div className="mt-3 space-y-2">
                {angles.map((angle, idx) => (
                  <div key={`${angle.idea_title}-${idx}`} className="rounded border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{angle.idea_title}</p>
                    <p className="text-sm text-slate-300">{angle.angle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generationResults && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold">Tweets & threads</h3>
              <GenerationResults results={generationResults} onSaveDraft={session ? handleSaveDraft : undefined} />
            </div>
          )}

          {shitpost && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold">Shitpost</h3>
              <p className="text-sm text-slate-200">{shitpost}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AppPage;
