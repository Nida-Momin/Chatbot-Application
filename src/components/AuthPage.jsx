// src/components/AuthPage.jsx

import { useState, useEffect } from 'react';
import { useNhostClient, useAuthenticationStatus } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Import the new stylesheet

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Default to Sign In for a better UX
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nhost = useNhostClient();
  const navigate = useNavigate();

  // This hook checks if the user is already authenticated
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  useEffect(() => {
    // If the auth state is not loading and the user is already signed in,
    // redirect them from the login page to the main app.
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const result = await nhost.auth.signUp({ email, password });
      if (result.error) {
        alert(result.error.message);
      } else {
        // On successful sign-up, Nhost automatically signs the user in,
        // so we can navigate them to the dashboard.
        // A confirmation email will be sent.
        navigate('/');
      }
    } else {
      const result = await nhost.auth.signIn({ email, password });
      if (result.error) {
        alert(result.error.message);
      } else {
        // On successful sign-in, navigate to the dashboard.
        navigate('/');
      }
    }
  };

  // While Nhost is checking the user's session, display a loading message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2>{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="toggle-auth-button"
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};