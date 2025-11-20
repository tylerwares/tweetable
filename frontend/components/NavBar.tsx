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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Tweetable
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {links.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2 py-1 transition hover:text-slate-900 ${
                  active ? 'bg-slate-100 text-slate-900' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/app"
          className="rounded-full bg-[#1d9bf0] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1583ca]"
        >
          Open app
        </Link>
      </div>
    </header>
  );
};

export default NavBar;
