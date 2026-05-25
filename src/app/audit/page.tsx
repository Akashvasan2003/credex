import type { Metadata } from "next";
import AuditForm from "@/features/audit/AuditForm";

export const metadata: Metadata = {
  title: "Start Your AI Spend Audit",
  description: "Add your AI tools and get instant savings recommendations. Free, no login required.",
};

export default function AuditPage() {
  return <AuditForm />;
}
