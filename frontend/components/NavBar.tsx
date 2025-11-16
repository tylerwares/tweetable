import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/app', label: 'App' }
];

const NavBar = () => {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-white">
          Tweetable
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          {links.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2 py-1 transition hover:text-white ${active ? 'bg-slate-800 text-white' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/app"
          className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-brand-dark hover:text-white"
        >
          Open app
        </Link>
      </div>
    </header>
  );
};

export default NavBar;
