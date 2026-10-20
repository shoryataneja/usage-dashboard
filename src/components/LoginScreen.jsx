import { useState } from 'react';
import { apiFetch, setBaseUrl, setToken, getBaseUrl } from '../api/client';

export default function LoginScreen({ onLogin }) {
  const [baseUrl, setBaseUrlInput] = useState(getBaseUrl());
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setBaseUrl(baseUrl);
    try {
      const { data } = await apiFetch('/auth/login', {
        method: 'POST',
        body: { mobileNumber, password },
      });
      setToken(data.accessToken);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">CarMetrik Usage Dashboard</h1>
        <p className="login__subtitle">
          Route-annotated operations portal — every widget shows the API route that feeds it.
        </p>

        <label className="field">
          <span className="field__label">API base URL</span>
          <input
            className="field__input"
            value={baseUrl}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="http://localhost:4000/api/v1"
          />
        </label>

        <label className="field">
          <span className="field__label">Mobile number</span>
          <input
            className="field__input"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="10-digit mobile"
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="field__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="alert alert--error">{error}</div>}

        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="login__hint">
          Uses <code>POST /api/v1/auth/login</code>. Login as an ADMIN / TH / TL user so the
          drawer&apos;s <code>GET /evaluations/queue</code> call is allowed.
        </p>
      </form>
    </div>
  );
}
