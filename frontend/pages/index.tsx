import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';

const IndexPage = () => (
  <>
    <Head>
      <title>Tweetable.app</title>
      <meta name="description" content="Make your thoughts tweetable." />
    </Head>
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <p className="rounded-full border border-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
              Creator productivity
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-6xl">
              Your thoughts, made tweet-able.
            </h1>
            <p className="text-lg text-slate-300">
              {/* TODO: replace with strong, benefit-focused copy explaining turning notes into tweet-ready drafts automatically. */}
              Turn long-form notes into authentic tweets and threads with tone controls that match your voice.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white"
              >
                Open the app
              </Link>
              <Link
                href="/features"
                className="rounded-full border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-brand hover:text-white"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Preview</p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
                {/* Placeholder UI preview */}Upload notes → Analyze voice → Adjust tone → Generate tweets.
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Upload notes', desc: 'Drop .txt or .md files or paste text.' },
              { title: 'Adjust tone', desc: 'Six sliders to match professionalism, polish, energy, and vibe.' },
              { title: 'Get drafts', desc: 'Short tweets, long tweets, and threads ready to copy.' }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Why Tweetable?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Built for authenticity', desc: '// TODO: describe voice-preserving generation benefits.' },
              { title: 'Speed for creators', desc: '// TODO: highlight faster publishing for builders and writers.' },
              { title: 'Tone control', desc: '// TODO: note the 6 sliders and regen controls.' }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Who it’s for</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Creators sharing daily learnings',
              'Founders building in public',
              'Writers turning drafts into posts',
              'Educators summarizing lessons'
            ].map((item) => (
              <div key={item} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
      <Footer />
    </main>
  </>
);

export default IndexPage;
