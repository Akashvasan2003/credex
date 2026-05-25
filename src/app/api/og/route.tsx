import { ImageResponse } from "next/og";
import { readEnv } from "@/lib/env";

export const runtime = "edge";

async function getAuditData(slug: string): Promise<{ savings: string; annualSavings: string; toolCount: number } | null> {
  try {
    const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey || supabaseUrl.includes("placeholder")) return null;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/audits?share_slug=eq.${slug}&select=total_monthly_savings,total_annual_savings,recommendations`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    const row = data[0];
    return {
      savings: `$${Math.round(row.total_monthly_savings).toLocaleString()}`,
      annualSavings: `$${Math.round(row.total_annual_savings).toLocaleString()}`,
      toolCount: Array.isArray(row.recommendations) ? row.recommendations.length : 0,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  let savings = "$0";
  let annualSavings = "$0";
  let toolCount = 0;

  if (slug) {
    const data = await getAuditData(slug);
    if (data) {
      savings = data.savings;
      annualSavings = data.annualSavings;
      toolCount = data.toolCount;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #080808 0%, #0d0d1a 50%, #080808 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff" }}>SpendLens</span>
        </div>

        {/* Main savings */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #34d399, #10b981)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          {annualSavings}
        </div>

        <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.5)", marginBottom: "48px" }}>
          annual savings identified across {toolCount} AI tool{toolCount !== 1 ? "s" : ""}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Monthly savings", value: savings },
            { label: "Annual savings", value: annualSavings },
            { label: "Tools audited", value: String(toolCount) },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px 32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          spendlens.ai · Free AI Spend Audit
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
