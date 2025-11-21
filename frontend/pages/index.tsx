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
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <NavBar />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <p className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-500">
              Creator productivity
            </p>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-6xl">
              Your thoughts, made tweet-able.
            </h1>
            <p className="text-lg text-slate-600">
              Turn long-form notes, journals, or idea dumps into authentic tweets and threads. Dial in tone with sliders and keep the outputs sounding like you—not a bot.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="rounded-full bg-[#1d9bf0] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1583ca]"
              >
                Open the app
              </Link>
              <Link
                href="/features"
                className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-[#1d9bf0] hover:text-[#1d9bf0]"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Preview</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {/* Placeholder UI preview */}Upload notes → Analyze voice → Adjust tone → Generate tweets.
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Upload notes', desc: 'Drop .txt or .md files or paste text. No storage—processed in-memory.' },
              { title: 'Adjust tone', desc: 'Six sliders for professionalism, polish, energy, optimism, depth, and spice.' },
              { title: 'Get drafts', desc: 'Four short tweets, four long tweets, and tight threads ready to copy.' }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl text-slate-900 font-semibold">Why Tweetable?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Built for authenticity',
                desc: 'Outputs stay in your voice: voice analysis + tone sliders keep the cadence and quirks.'
              },
              {
                title: 'Speed for creators',
                desc: 'Go from raw notes to publishable drafts in minutes instead of hours.'
              },
              {
                title: 'Tone control',
                desc: 'Six sliders and per-tweet regeneration keep you in control of energy, polish, and spice.'
              }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Who it’s for</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Creators sharing daily learnings',
              'Founders building in public',
              'Writers turning drafts into posts',
              'Educators summarizing lessons'
            ].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
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
