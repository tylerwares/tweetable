import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default App;
