export const dynamic = "force-dynamic";
import RecruitmentForm from '@/components/RecruitmentForm';

export default function NewScoutingPage() {
  return (
    <div className="max-w-3xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-brand-800 mb-1">Add prospect</h1>
      <p className="text-sm text-slate-600 mb-5">Register a new player in the recruitment pipeline</p>
      <div className="card p-6"><RecruitmentForm /></div>
    </div>
  );
}
