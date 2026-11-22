'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api, uploadImage } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { PageLoading, Spinner } from '@/components/PageLoading';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  blocked: boolean;
  createdAt?: string;
}

/** Client-only: profile update form (name, phone, image upload or URL). */
export function ProfileForm({ profile }: { profile: ProfileData }) {
  const { showToast } = useToast();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [imageUrl, setImageUrl] = useState(profile.image || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let image = imageUrl.trim();
      if (imageFile) {
        image = (await uploadImage(imageFile)).url;
        setImageUrl(image);
        showToast('success', 'Image uploaded.');
      }
      const res = await api<{ profile?: ProfileData; error?: string }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, image: image || null }),
      });
      showToast('success', 'Profile updated.');
      if (res.profile) {
        setName(res.profile.name);
        setPhone(res.profile.phone || '');
        setImageUrl(res.profile.image || '');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
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
          <label htmlFor="profile-phone" className="block text-sm font-medium text-neutral-700">Phone</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
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
            placeholder="Or upload an image below"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <p className="mt-2">
            <label
              htmlFor="profile-image-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <Spinner /> Upload Image
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
          {imageUrl && <img src={imageUrl} alt="Profile image" className="mt-3 h-20 rounded-lg border border-neutral-200 object-cover" />}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading && <Spinner size={16} />}
          Save Profile
        </button>
      </form>

      <div className="mt-6 text-sm text-neutral-500">
        <p>Email: {profile.email || '—'}</p>
        <p className="mt-1">Role: <span className="capitalize">{profile.role}</span> (read-only)</p>
        <p className="mt-1">Account status: <span className={profile.blocked ? 'text-red-600' : 'text-emerald-600'}>{profile.blocked ? 'Blocked' : 'Active'}</span> (read-only)</p>
        {profile.createdAt && <p className="mt-1">Signed up: {new Date(profile.createdAt).toLocaleDateString()}</p>}
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm font-medium text-neutral-600 hover:underline">← Back to home</Link>
      </div>
    </section>
  );
}
