/**
 * Custom App Component for OpenWord Control Panel
 * 
 * Wraps the entire application with AuthProvider to provide
 * authentication state throughout all pages.
 */

import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
