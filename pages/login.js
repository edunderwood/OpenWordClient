/**
 * Login Page for OpenWord Control Panel
 * 
 * Provides email/password login with "Forgot Password" functionality
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirect to control panel
        router.push('/control');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show password reset form
  if (showResetPassword) {
    return (
      <>
        <Head>
          <title>Reset Password - OpenWord Control Panel</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Reset Password</h1>
            
            {resetSent ? (
              <div className={styles.success}>
                <p className={styles.successTitle}>Check Your Email!</p>
                <p>We've sent a password reset link to <strong>{resetEmail}</strong></p>
                <p>Click the link in the email to reset your password.</p>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className={styles.button}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className={styles.form}>
                <p className={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className={styles.error}>{error}</div>}
                
                <div className={styles.formGroup}>
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setError('');
                  }}
                  className={styles.linkButton}
                >
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  // Show login form
  return (
    <>
      <Head>
        <title>Login - OpenWord Control Panel</title>
        <meta name="description" content="Sign in to manage your translation service" />
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <h1 className={styles.title}>OpenWord</h1>
            <p className={styles.subtitle}>Control Panel</p>
          </div>
          
          <p className={styles.description}>
            Sign in to manage your real-time translation service
          </p>
          
          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetPassword(true);
                setError('');
              }}
              className={styles.linkButton}
              disabled={loading}
            >
              Forgot password?
            </button>
          </form>

          <div className={styles.footer}>
            <p>Need help? Contact support</p>
          </div>
        </div>
      </div>
    </>
  );
}
