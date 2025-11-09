import DraftCard from './DraftCard';

export type GenerationResponse = {
  short_tweets: string[];
  long_tweets: string[];
  threads: string[][];
};

type GenerationResultsProps = {
  results?: GenerationResponse;
  onSaveDraft?: (content: string) => void;
};

const GenerationResults = ({ results, onSaveDraft }: GenerationResultsProps) => {
  if (!results) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-center text-sm text-slate-500">
        Generated tweets will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Short Tweets
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {results.short_tweets.map((tweet, index) => (
            <DraftCard key={`short-${index}`} content={tweet} onSave={onSaveDraft} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Long Tweets
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {results.long_tweets.map((tweet, index) => (
            <DraftCard key={`long-${index}`} content={tweet} onSave={onSaveDraft} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Threads</h3>
        <div className="mt-3 space-y-3">
          {results.threads.map((thread, index) => (
            <DraftCard
              key={`thread-${index}`}
              content={thread.join('\n')}
              onSave={onSaveDraft}
              variant="thread"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GenerationResults;
