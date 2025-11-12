import Link from 'next/link';

const Footer = () => (
  <footer className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
      <p>© {new Date().getFullYear()} Tweetable</p>
      <nav className="flex gap-4">
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <a href="mailto:support@tweetable.app" className="hover:underline">
          Contact
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;

