import Head from 'next/head';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy — Tweetable</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold">Privacy Policy</h1>
            <p className="text-sm text-slate-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>
          </header>

          <section className="space-y-6">
            <p>
              Tweetable (“we”, “our”, “us”) respects your privacy. This policy explains what
              information we collect, how we use it, and the choices you have.
            </p>
            <h2 className="text-xl font-semibold">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                Account data: email address and authentication identifiers managed by Supabase and
                third‑party providers (e.g., Google).
              </li>
              <li>
                App data: notes you upload or paste, generated drafts, and your selected persona.
              </li>
              <li>
                Usage data: basic analytics and service logs for reliability and abuse prevention.
              </li>
              <li>
                Billing data: subscription and payment information processed by Stripe. We do not
                store full card numbers on our servers.
              </li>
            </ul>

            <h2 className="text-xl font-semibold">How we use information</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Provide and improve the service (generation, drafts, personas).</li>
              <li>Authenticate users and enforce plan limits.</li>
              <li>Process subscriptions and payments via Stripe.</li>
              <li>Monitor abuse and maintain security.</li>
            </ul>

            <h2 className="text-xl font-semibold">Google OAuth disclosure</h2>
            <p className="text-slate-300">
              If you choose “Continue with Google,” we use Google Sign‑In solely for authentication
              and account creation. We request basic profile information (name, email) through
              standard OpenID scopes (<code className="px-1">openid</code>, <code className="px-1">email</code>,
              <code className="px-1">profile</code>). We do not request sensitive or restricted Google
              scopes, and we do not use your Google data for advertising.
            </p>

            <h2 className="text-xl font-semibold">Data sharing</h2>
            <p className="text-slate-300">
              We share data with service providers solely to operate Tweetable:
              Supabase (auth/database), Render (API hosting), Vercel (frontend hosting), OpenAI
              (content generation), and Stripe (billing). We do not sell personal information.
            </p>

            <h2 className="text-xl font-semibold">Data retention</h2>
            <p className="text-slate-300">
              We retain account and draft data while your account is active. You can request data
              deletion by contacting us.
            </p>

            <h2 className="text-xl font-semibold">Data deletion</h2>
            <p className="text-slate-300">
              You may request deletion of your account and related data at any time by emailing
              <span className="px-1 underline">support@tweetable.app</span> from your registered email. We’ll
              confirm deletion within a reasonable timeframe. Subscription billing records may be
              retained as required by law.
            </p>

            <h2 className="text-xl font-semibold">Your choices</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Access, update, or delete your data by contacting support.</li>
              <li>Unsubscribe from marketing emails using in‑email controls (if applicable).</li>
              <li>Close your account to remove personal data where required by law.</li>
            </ul>

            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="text-slate-300">
              Questions? Email us at <span className="underline">support@tweetable.app</span>.
            </p>
          </section>

          <p className="text-sm text-slate-400">
            Return to <Link href="/" className="underline">Home</Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default PrivacyPolicyPage;
