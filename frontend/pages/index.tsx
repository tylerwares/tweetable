import Head from 'next/head';
import Link from 'next/link';

const IndexPage = () => (
  <>
    <Head>
      <title>Tweetable.app</title>
      <meta name="description" content="Make your thoughts tweetable." />
    </Head>
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-slate-950 px-6 py-16 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Make your thoughts tweetable.
        </h1>
        <p className="text-lg text-slate-300">
          Transform notes into tweet-ready drafts using personas that sound just like you. Upload,
          generate, and publish without losing your voice.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/app"
            className="rounded-full bg-brand px-8 py-3 font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white"
          >
            Launch the app
          </Link>
          <Link
            href="/drafts"
            className="rounded-full border border-slate-700 px-8 py-3 font-semibold text-slate-200 transition hover:border-brand hover:text-white"
          >
            View drafts
          </Link>
        </div>
      </div>
    </main>
  </>
);

export default IndexPage;
