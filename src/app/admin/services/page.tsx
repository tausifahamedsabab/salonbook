'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatMoney, uploadImage } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { Service } from '@/lib/types';

interface ServiceForm {
  name: string;
  description: string;
  category: string;
  price: string;
  durationMinutes: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  category: 'general',
  price: '',
  durationMinutes: '60',
  imageUrl: '',
  isActive: true,
};

export default function AdminServicesPage() {
  useAuthGuard('admin');

  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const { services } = await api<{ services: Service[] }>('/api/services');
    setServices(services);
  }, []);

  useEffect(() => {
    api<{ services: Service[] }>('/api/services')
      .then((r) => setServices(r.services))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  function startEdit(s: Service) {
    setEditingId(s._id);
    setForm({
      name: s.name,
      description: s.description || '',
      category: s.category || 'general',
      price: String(s.price ?? ''),
      durationMinutes: String(s.durationMinutes ?? ''),
      imageUrl: s.imageUrl || '',
      isActive: s.isActive !== false,
    });
    setError('');
    setNotice('');
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name.trim(),
      description: form.description,
      category: form.category || 'general',
      price: Number(form.price),
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 60,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    };
    try {
      if (editingId) await api(`/api/services/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/services', { method: 'POST', body: JSON.stringify(payload) });
      setNotice(editingId ? 'Service updated.' : 'Service created.');
      startAdd();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this service?')) return;
    setError('');
    try {
      await api(`/api/services/${id}`, { method: 'DELETE' });
      setNotice('Service deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      setNotice('Image uploaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Manage Services</h1>
        <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Admin Dashboard
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-4 text-sm text-emerald-700">{notice}</p>}

      {/* Add / Edit form */}
      <div className="mt-6 rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900">{editingId ? 'Edit service' : 'Add new service'}</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="svc-name" className="block text-sm font-medium text-neutral-700">Name</label>
              <input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="svc-price" className="block text-sm font-medium text-neutral-700">Price ($)</label>
              <input
                id="svc-price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="svc-category" className="block text-sm font-medium text-neutral-700">Category</label>
              <input
                id="svc-category"
                list="svc-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
              <datalist id="svc-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="svc-duration" className="block text-sm font-medium text-neutral-700">Duration (minutes)</label>
              <input
                id="svc-duration"
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="svc-description" className="block text-sm font-medium text-neutral-700">Description</label>
            <textarea
              id="svc-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Image</label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
                className="text-sm text-neutral-600"
              />
              {uploading && <span className="text-sm text-neutral-500">Uploading…</span>}
            </div>
            {form.imageUrl && (
              <>
                <img src={form.imageUrl} alt={form.name} className="mt-2 h-20 rounded-lg border border-neutral-200 object-cover" />
                <p className="mt-1 text-xs text-neutral-500">{form.imageUrl}</p>
              </>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (listed in the public catalog)
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700">
              {editingId ? 'Update Service' : 'Create Service'}
            </button>
            {editingId && (
              <button type="button" onClick={startAdd} className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Service list */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-neutral-900">Services ({services.length})</h2>
        {loading ? (
          <p className="mt-4 text-neutral-500">Loading…</p>
        ) : services.length === 0 ? (
          <p className="mt-4 text-neutral-500">No services yet.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4 text-right">Price</th>
                <th className="py-3 pr-4 text-right">Active</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id} className="border-b border-neutral-200">
                  <td className="py-3 pr-4 font-medium text-neutral-900">{s.name}</td>
                  <td className="py-3 pr-4 text-neutral-500">{s.category}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{formatMoney(s.price)}</td>
                  <td className="py-3 pr-4 text-right">{s.isActive === false ? 'No' : 'Yes'}</td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(s)} className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                        Edit
                      </button>
                      <button onClick={() => remove(s._id)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
