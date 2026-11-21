'use client';

import { FormEvent, useState } from 'react';
import { api, uploadImage } from '@/lib/api';
import { Service } from '@/lib/types';

export type { Service };

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

/** Client-only component: the add/edit form for services (Admin Services page). */
export function ServiceFormModal() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-neutral-200 p-6">
      {open && <ServiceForm close={() => setOpen(false)} onSaved={() => setOpen(false)} />}
      {!open && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Add new service</h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            Add Service
          </button>
        </div>
      )}
    </div>
  );
}

/** Client-only component: row actions for services — Edit, Activate/Deactivate, Delete. */
export function ServiceRowActions({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);
  const isActive = service.isActive !== false;

  async function setActive(v: boolean) {
    try {
      await api(`/api/services/${service._id}/status`, { method: 'PUT', body: JSON.stringify({ isActive: v }) });
      location.reload();
    } catch {
      /* backend error message is rare; ignore */
    }
  }

  async function remove() {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api(`/api/services/${service._id}`, { method: 'DELETE' });
      location.reload();
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {editing && <ServiceForm close={() => setEditing(false)} onSaved={() => setEditing(false)} service={service} />}
      {!editing && (
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditing(true)} className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
            Edit
          </button>
          <button
            onClick={() => setActive(!isActive)}
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => void remove()} className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
            Delete
          </button>
        </div>
      )}
    </>
  );
}

/** Client-only component: the actual form (shared by add + edit). */
function ServiceForm({ close, onSaved, service }: { close: () => void; onSaved: () => void; service?: Service }) {
  const [form, setForm] = useState<ServiceForm>(() =>
    service
      ? {
          name: service.name,
          description: service.description || '',
          category: service.category || 'general',
          price: String(service.price ?? ''),
          durationMinutes: String(service.durationMinutes ?? ''),
          imageUrl: service.imageUrl || '',
          isActive: service.isActive !== false,
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const isValid = /^\d+(\.\d+)?$/.test(form.price) && Number(form.price) > 0 && form.name.trim() !== '';

  async function upload(file: File) {
    setUploading(true);
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

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        category: form.category || 'general',
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes) || 60,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      };
      if (service) {
        await api(`/api/services/${service._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/services', { method: 'POST', body: JSON.stringify(payload) });
      }
      setNotice(service ? 'Service updated.' : 'Service created.');
      onSaved();
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="svc-name" className="block text-sm font-medium text-neutral-700">Service Name</label>
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
          <label htmlFor="svc-duration" className="block text-sm font-medium text-neutral-700">Estimated Duration (minutes)</label>
          <input
            id="svc-duration"
            type="number"
            min={1}
            step={1}
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="svc-category" className="block text-sm font-medium text-neutral-700">Service Category</label>
          <input
            id="svc-category"
            list="svc-categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <datalist id="svc-categories">
            {['Haircut', 'Coloring', 'Facial', 'Makeup', 'Nails', 'Spa'].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
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
        <label className="block text-sm font-medium text-neutral-700">Service Image (Upload)</label>
        <div className="mt-1 flex items-center gap-4">
          <label className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
            Choose Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          {uploading && <span className="text-sm text-neutral-500">Uploading…</span>}
        </div>
        {form.imageUrl && (
          <>
            <img src={form.imageUrl} alt={form.name || 'service image'} className="mt-3 h-20 rounded-lg border border-neutral-200 object-cover" />
            <p className="mt-1 text-xs text-neutral-500">{form.imageUrl}</p>
          </>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Service Status: {form.isActive ? 'Active' : 'Inactive'} (Active = visible in catalog)
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isValid || uploading}
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {service ? 'Update Service' : 'Create Service'}
        </button>
        {service && (
          <button type="button" onClick={close} className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
