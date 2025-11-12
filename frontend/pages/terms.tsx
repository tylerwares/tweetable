import Head from 'next/head';
import Link from 'next/link';

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Service — Tweetable</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold">Terms of Service</h1>
            <p className="text-sm text-slate-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>
          </header>

          <section className="space-y-4">
            <p>
              These Terms govern your access to and use of Tweetable (“Service”). By using the
              Service, you agree to these Terms.
            </p>

            <h2 className="text-xl font-semibold">1. Accounts</h2>
            <p className="text-slate-300">
              You are responsible for your account and all activity under it. Keep your credentials
              secure and comply with applicable laws.
            </p>

            <h2 className="text-xl font-semibold">2. Acceptable use</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>No illegal, harmful, or abusive content.</li>
              <li>No attempts to disrupt or misuse the Service or the underlying providers.</li>
              <li>Respect third‑party rights when using generated content.</li>
            </ul>

            <h2 className="text-xl font-semibold">3. Plans and billing</h2>
            <p className="text-slate-300">
              Free plan limits are enforced in‑app. Pro plan is billed via Stripe subscription. By
              subscribing, you authorize recurring charges until cancellation.
            </p>

            <h2 className="text-xl font-semibold">4. AI‑generated content</h2>
            <p className="text-slate-300">
              Content is generated using third‑party models and may contain inaccuracies. You are
              responsible for reviewing and complying with platform policies (e.g., X/Twitter) before
              posting.
            </p>

            <h2 className="text-xl font-semibold">5. Service changes</h2>
            <p className="text-slate-300">
              We may modify or discontinue features at any time. We will make reasonable efforts to
              notify you of material changes.
            </p>

            <h2 className="text-xl font-semibold">6. Disclaimers and liability</h2>
            <p className="text-slate-300">
              The Service is provided “as is” without warranties. To the extent permitted by law, we
              are not liable for indirect or consequential damages arising from your use of the
              Service.
            </p>

            <h2 className="text-xl font-semibold">7. Termination</h2>
            <p className="text-slate-300">
              We may suspend or terminate access for violations of these Terms. You may cancel your
              subscription at any time via Stripe.
            </p>

            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="text-slate-300">
              Questions about these Terms? Contact <span className="underline">support@tweetable.app</span>.
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

export default TermsPage;

