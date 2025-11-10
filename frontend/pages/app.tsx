import { useEffect, useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import GenerationResults, { GenerationResponse } from '@/components/GenerationResults';
import PersonaSelector, { Persona } from '@/components/PersonaSelector';
import UploadZone from '@/components/UploadZone';
import { useAuth } from '@/hooks/useAuth';
import { postJson } from '@/utils/api';
import { useSupabase } from '@/utils/useSupabase';

const demoResults: GenerationResponse = {
  short_tweets: ['Ship faster by writing shorter requirements.', 'Your backlog is not a museum.'],
  long_tweets: [
    'Consistency beats intensity. Write one insight every morning and watch your audience grow.',
    'Builders win when they share progress in public. Momentum compounds with every update.'
  ],
  threads: [
    [
      'Thread: Turn your notes into public learnings.',
      '1/ Summarize the big idea.',
      '2/ Break it into tweets.',
      '3/ Ask the right question.',
      '4/ Ship it.'
    ]
  ]
};

const AppPage = () => {
  const [persona, setPersona] = useState<Persona>('builder');
  const [results, setResults] = useState<GenerationResponse | undefined>(demoResults);
  const [personaBio, setPersonaBio] = useState<string | undefined>();
  const [noteContent, setNoteContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const supabase = useSupabase();
  const { session, loading: authLoading } = useAuth();

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      window.location.replace('/login');
    }
  }, [authLoading, session]);

  useEffect(() => {
    if (session && authMessage) {
      setAuthMessage(null);
    }
  }, [session, authMessage]);

  const handleSaveDraft = async (content: string) => {
    if (!supabase || !session) {
      setAuthMessage('Sign in to save drafts to your Supabase account.');
      return;
    }

    try {
      await supabase.from('drafts').insert({ content, persona });
    } catch (error) {
      console.error('Saving draft failed', error);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      setAuthMessage('Sign in to generate fresh drafts.');
      return;
    }

    setIsGenerating(true);
    try {
      const token = session.access_token;
      const response = await postJson<
        {
          persona: Persona;
          prompt: string;
          persona_bio?: string;
        },
        GenerationResponse
      >(
        '/generate',
        {
          persona,
          prompt: noteContent || 'Paste note content here or provide a note_id via future UI.',
          persona_bio: personaBio
        },
        token
      );

      setResults(response);
    } catch (error) {
      console.error('Generation failed', error);
      setResults(demoResults);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <AuthHeader />
        {authMessage && (
          <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {authMessage}
          </div>
        )}
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full space-y-6 lg:max-w-sm">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <UploadZone onUpload={({ text }) => setNoteContent(text ?? '')} />
          <PersonaSelector
            persona={persona}
            onPersonaChange={setPersona}
            onImportBio={setPersonaBio}
          />
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating || !session || authLoading}
          >
            {isGenerating ? 'Generating…' : session ? 'Generate drafts' : 'Sign in to generate'}
          </button>
        </section>

        <section className="w-full flex-1 space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-slate-50">Generation results</h2>
            <p className="text-sm text-slate-400">
              This is example data wired to Supabase insert calls. Persona bio: {personaBio ?? 'n/a'}.
            </p>
          </header>
          <GenerationResults results={results} onSaveDraft={session ? handleSaveDraft : undefined} />
        </section>
      </div>
    </main>
  );
};

export default AppPage;
