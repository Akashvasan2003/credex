import type { Metadata } from "next";
import { getAuditBySlug } from "@/features/audit/actions";
import { readEnv } from "@/lib/env";
import ResultsPage from "@/features/results/ResultsPage";
import { formatCurrency } from "@/utils/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  const appUrl = readEnv("NEXT_PUBLIC_APP_URL") ?? "https://spendlens.ai";

  if (!audit) {
    return { title: "Audit Not Found" };
  }

  const title = `AI Spend Audit — ${formatCurrency(audit.totalAnnualSavings)}/yr savings identified`;
  const description = audit.aiSummary?.slice(0, 160) ?? "See how this team can optimize their AI tool spending.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${appUrl}/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${appUrl}/api/og?slug=${slug}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Audit not found or expired.</p>
          <a href="/audit" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Start your own audit →
          </a>
        </div>
      </div>
    );
  }

  // Strip PII for public view
  const publicAudit = {
    ...audit,
    input: {
      ...audit.input,
      // Keep tools, teamSize, useCase — remove nothing sensitive here
    },
  };

  return <ResultsPage audit={publicAudit} isShared={true} />;
}
