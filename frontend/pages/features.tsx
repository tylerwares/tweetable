import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const features = [
  { title: 'Voice-preserving generation', desc: '// TODO: describe how Tweetable keeps your authentic voice.' },
  { title: 'Tone sliders', desc: '// TODO: mention the 6 sliders to fine-tune professionalism, energy, and vibe.' },
  { title: 'Multiple formats', desc: '// TODO: short tweets, long tweets, threads all at once.' },
  { title: 'Playground', desc: '// TODO: shitpost/ragebait sandbox without affecting main flow.' }
];

const FeaturesPage = () => (
  <main className="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-8">
      <h1 className="text-3xl font-semibold">Features</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-lg font-semibold text-white">{feature.title}</p>
            <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </main>
);

export default FeaturesPage;
