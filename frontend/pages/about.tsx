import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const AboutPage = () => (
  <main className="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-8">
      <h1 className="text-3xl font-semibold">About Tweetable</h1>
      <div className="space-y-4 text-sm text-slate-300">
        <p>// TODO: replace this with a concise explanation of what Tweetable is and why it exists.</p>
        <p>// TODO: share the mission/philosophy and how Tweetable helps creators publish faster.</p>
        <p>// TODO: describe who it is built for (creators, founders, writers) and how it fits their workflow.</p>
      </div>
    </section>
    <Footer />
  </main>
);

export default AboutPage;
