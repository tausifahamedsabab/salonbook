'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const PASSWORD_RULES = 'Password must be at least 6 characters long and include one uppercase letter and one lowercase letter.';
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!PASSWORD_RE.test(password)) {
      setError(PASSWORD_RULES);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const image = imageFile ? (await uploadAvatar(imageFile)).url : profileImage;
      await authClient.signUp.email({ name, email, password, image: image || undefined });
      router.push('/customer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-neutral-200 p-8">
        <h1 className="text-2xl font-bold text-neutral-900">Sign up</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Create your account to request appointments. Customers can only register via this form.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
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
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">{PASSWORD_RULES}</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="profile-image" className="block text-sm font-medium text-neutral-700">Profile Image (URL)</label>
            <input
              id="profile-image"
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="Optional image URL"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <p className="mt-2">
              <label htmlFor="profile-image-file" className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
                Upload Image
                <input
                  id="profile-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageFile(file);
                  }}
                />
              </label>
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-2.5 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-5 text-sm text-neutral-500">
          Already have an account? <Link href="/sign-in" className="font-medium text-neutral-900 hover:underline">Sign in</Link>.
        </p>
      </div>
    </section>
  );
}

async function uploadAvatar(file: File): Promise<{ url: string }> {
  const { uploadImage } = await import('@/lib/api');
  return uploadImage(file);
}
