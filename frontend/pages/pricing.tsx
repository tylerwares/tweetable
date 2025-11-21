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
  <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="text-sm text-slate-600">Choose the plan that fits your publishing cadence. Upgrade when you need more horsepower.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold">{plan.name}</p>
            <p className="text-2xl font-bold text-slate-900">{plan.price}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {plan.features.map((feat) => (
                <li key={feat}>• {feat}</li>
              ))}
            </ul>
            <button className="mt-4 w-full rounded-md bg-[#1d9bf0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1583ca]">
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
