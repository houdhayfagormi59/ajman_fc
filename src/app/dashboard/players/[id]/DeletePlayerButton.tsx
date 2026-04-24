'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Trash2 } from 'lucide-react';

export default function DeletePlayerButton({ playerId }: { playerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm('Delete this player? All injuries, performances and evaluations will be removed.')) return;
    setLoading(true);
    const res = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard/players');
      router.refresh();
    } else {
      alert('Delete failed');
    }
  }

  return (
    <Button variant="danger" onClick={onDelete} loading={loading}>
      <Trash2 size={15} /> Delete
    </Button>
  );
}
