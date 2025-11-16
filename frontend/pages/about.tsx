import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const AboutPage = () => (
  <main className="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 space-y-8">
      <h1 className="text-3xl font-semibold">About Tweetable</h1>
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Tweetable turns your long-form notes and brain dumps into tweet-ready drafts without losing your voice.
          It’s built for creators, founders, and writers who want to publish faster without sounding generic.
        </p>
        <p>
          We analyze your writing style, surface tweet-worthy ideas, and give you tone sliders to fine-tune every draft.
          Less overthinking, more sharing.
        </p>
        <p>
          Designed for people who build in public, teach, or ship daily. You bring the ideas; Tweetable keeps them sharp,
          authentic, and ready to post.
        </p>
      </div>
    </section>
    <Footer />
  </main>
);

export default AboutPage;
