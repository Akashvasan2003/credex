import { getAuditById } from "@/features/audit/actions";
import ResultsPage from "@/features/results/ResultsPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultsByIdPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Audit not found.</p>
          <a href="/audit" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Start a new audit &rarr;
          </a>
        </div>
      </div>
    );
  }

  return <ResultsPage audit={audit} />;
}
