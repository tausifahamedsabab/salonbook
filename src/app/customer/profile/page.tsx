import { serverApi, requireRoleServer } from '@/lib/serverApi';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  await requireRoleServer('any', '/sign-in');
  const { profile } = await serverApi<{ profile: ProfileData }>('/api/users/profile');
  return <ProfileForm profile={profile} />;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  blocked: boolean;
  createdAt?: string;
}

// Client-only interactive form (separate chunk, so the page stays a Server Component).
import { ProfileForm } from './ProfileForm';
