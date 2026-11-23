'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authClient.signIn.email({ email, password });
      if (response.error) {
        setError(response.error.message || 'Sign-in failed.');
        return;
      }
      const user = response.data?.user as { role?: string } | null;
      router.push(user?.role === 'admin' ? '/admin' : '/customer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      // Return the browser to the frontend after Google — otherwise Better Auth
      // redirects to the backend root, which has no route (404 "Not found").
      const response = await authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin });
      if (response.error) {
        setError(response.error.message || 'Google sign-in failed.');
        return;
      }
      const url = response.data?.url;
      if (url) {
        window.location.assign(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-neutral-200 p-8">
        <h1 className="text-2xl font-bold text-neutral-900">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Use your account to view appointments, pay for services and manage your dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-2.5 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            className="mt-3 w-full rounded-full border border-neutral-300 py-2.5 font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Continue with Google
          </button>
        </form>
        <p className="mt-5 text-sm text-neutral-500">
          Don&apos;t have an account? <Link href="/sign-up" className="font-medium text-neutral-900 hover:underline">Sign up</Link>.
        </p>
      </div>
    </section>
  );
}
