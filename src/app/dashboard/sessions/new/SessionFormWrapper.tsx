'use client';
import { useRouter } from 'next/navigation';
import SessionForm from '@/components/SessionForm';
import type { Team } from '@/lib/types';

export default function SessionFormWrapper({ teams }: { teams: Team[] }) {
  const router = useRouter();
  return <SessionForm teams={teams} onSaved={() => router.push('/dashboard/sessions')} />;
}
