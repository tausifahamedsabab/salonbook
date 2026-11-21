'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useSession } from '@/lib/session';
import { uploadImage } from '@/lib/api';
import type { AppUser } from '@/lib/types';

export default function ProfilePage() {
  useAuthGuard('any');
  const user: AppUser | null = useSession().data?.user ?? null;
  const [name, setName] = useState(user?.name ?? '');
  const [imageUrl, setImageUrl] = useState(user?.image ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      let image = imageUrl;
      if (imageFile) {
        image = (await uploadImage(imageFile)).url;
        setImageUrl(image);
      }
      const res = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, image: image || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || `Update failed (${res.status})`);
        return;
      }
      setNotice('Profile updated.');
    } catch {
      setError('Update failed.');
    }
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-neutral-500">You need to be signed in to view your profile.</p>
        <Link href="/sign-in" className="text-sm font-medium text-neutral-900 hover:underline">Sign in</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Profile</h1>

      <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border border-neutral-200 p-6">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-neutral-700">Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="profile-image-url" className="block text-sm font-medium text-neutral-700">Image URL</label>
          <input
            id="profile-image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
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
          {imageUrl && <img src={imageUrl} alt="Profile image" className="mt-3 h-20 rounded-lg object-cover" />}
        </div>
        {notice && <p className="text-sm text-emerald-700">{notice}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded-full bg-neutral-900 px-6 py-2 font-medium text-white transition hover:bg-neutral-700"
        >
          Save Profile
        </button>
      </form>

      <div className="mt-6 text-sm text-neutral-500">
        <p>Email: {user.email || '—'}</p>
        <p className="mt-1">Role: <span className="capitalize">{user.role}</span></p>
      </div>
    </section>
  );
}
