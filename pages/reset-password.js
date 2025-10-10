/**
 * Reset Password Page for OpenWord Control Panel
 * 
 * Allows users to set a new password after clicking reset link from email
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Auth.module.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { updatePassword, session, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated via password reset link
    // If not, redirect to login
    if (!session && !user) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, user, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Check for at least one number or special character (optional but recommended)
    const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(password);
    if (!hasNumberOrSpecial) {
      setError('Password should contain at least one number or special character');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to control panel after 2 seconds
        setTimeout(() => {
          router.push('/control');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!session && !user) {
    return (
      <>
        <Head>
          <title>Reset Password - OpenWord</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Redirecting...</h1>
            <p className={styles.subtitle}>Please wait while we verify your session</p>
          </div>
        </div>
      </>
    );
  }

  // Show success message
  if (success) {
    return (
      <>
        <Head>
          <title>Password Updated - OpenWord</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Password Updated!</h1>
            <div className={styles.success}>
              <p>Your password has been successfully updated.</p>
              <p>Redirecting to control panel...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show password reset form
  return (
    <>
      <Head>
        <title>Set New Password - OpenWord</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>Choose a strong password to secure your account</p>
          
          <form onSubmit={handleResetPassword} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
              />
              <small className={styles.hint}>
                At least 8 characters with a number or special character
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthLabel}>Password strength:</div>
                <div className={styles.strengthBar}>
                  <div 
                    className={`${styles.strengthFill} ${
                      password.length >= 12 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
                        ? styles.strong
                        : password.length >= 8 && /[0-9!@#$%^&*]/.test(password)
                        ? styles.medium
                        : styles.weak
                    }`}
                    style={{
                      width: 
                        password.length >= 12 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
                          ? '100%'
                          : password.length >= 8 && /[0-9!@#$%^&*]/.test(password)
                          ? '66%'
                          : '33%'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className={styles.button}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
