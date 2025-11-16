import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const plans = [
  {
    name: 'Free',
    price: '$0/month',
    cta: 'Get started',
    features: [
      'Limited uploads and generations per month',
      'Core tweet + thread generation',
      'Tone sliders included'
    ]
  },
  {
    name: 'Premium',
    price: '$X/month',
    cta: 'Upgrade to Premium',
    features: [
      'Increased or unlimited generations',
      'Priority processing',
      'Full playground access and regen controls'
    ]
  }
];

const PricingPage = () => (
  <main className="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="text-sm text-slate-400">Choose the plan that fits your publishing cadence. Upgrade when you need more horsepower.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-lg font-semibold text-white">{plan.name}</p>
            <p className="text-2xl font-bold text-white">{plan.price}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {plan.features.map((feat) => (
                <li key={feat}>• {feat}</li>
              ))}
            </ul>
            <button className="mt-4 w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-brand-dark hover:text-white">
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </main>
);

export default PricingPage;
