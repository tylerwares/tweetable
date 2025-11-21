import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const features = [
  { title: 'Voice-preserving generation', desc: 'Voice analysis + tone sliders keep drafts sounding like you.' },
  { title: 'Tone sliders', desc: 'Six dimensions to adjust professionalism, polish, energy, optimism, depth, and spice.' },
  { title: 'Multiple formats', desc: 'Four short tweets, four long tweets, two threads in one pass.' },
  { title: 'Playground', desc: 'A sandbox for shitposts and ragebait without touching your main flow.' }
];

const FeaturesPage = () => (
  <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-8">
      <h1 className="text-3xl font-semibold">Features</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">{feature.title}</p>
            <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </main>
);

export default FeaturesPage;
