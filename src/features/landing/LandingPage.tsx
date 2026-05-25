"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, TrendingDown, BarChart3, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const STATS = [
  { value: "$2,400", label: "avg annual savings" },
  { value: "3 min", label: "to complete audit" },
  { value: "8+", label: "AI tools supported" },
  { value: "100%", label: "free, no login" },
];

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Detect Overspending",
    desc: "Identify plans that don't match your actual usage. No guesswork — real pricing data.",
  },
  {
    icon: BarChart3,
    title: "Compare Alternatives",
    desc: "See side-by-side comparisons of tools that do the same job for less.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summary",
    desc: "Get a plain-English explanation of your biggest savings opportunities.",
  },
  {
    icon: Shield,
    title: "Finance-Defensible",
    desc: "Every recommendation cites verified pricing. Share with your CFO confidently.",
  },
];

const TOOLS = ["Cursor", "GitHub Copilot", "Claude", "ChatGPT", "Anthropic API", "OpenAI API", "Gemini", "Windsurf"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">SpendLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/audit" className="text-sm text-white/50 hover:text-white transition-colors">
              Start Audit
            </Link>
            <Link href="/audit">
              <Button size="sm">Free Audit →</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Free AI Spend Audit · No login required
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Stop overpaying for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              AI tools
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Audit your entire AI stack in 3 minutes. Get specific, defensible recommendations
            with real savings numbers — not vague advice.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/audit">
              <Button size="lg" className="w-full sm:w-auto group">
                Start Free Audit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-white/30">Takes 3 minutes · No credit card</p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeUp}
          className="relative mx-auto max-w-3xl mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-[#0d0d0d] px-6 py-5 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Tools marquee */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...TOOLS, ...TOOLS].map((tool, i) => (
            <span key={i} className="text-sm text-white/25 font-medium px-4">
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built for founders who care about burn
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Not a generic cost calculator. A real audit engine with verified pricing data and specific recommendations.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="group rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-indigo-950/10">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How it works
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { step: "01", title: "Enter your AI stack", desc: "Add each tool, plan, and number of seats. Takes under 2 minutes." },
              { step: "02", title: "Get instant analysis", desc: "Our audit engine checks every tool against verified pricing data and usage patterns." },
              { step: "03", title: "See your savings", desc: "Get a detailed breakdown with specific recommendations and exact dollar amounts." },
              { step: "04", title: "Share or act", desc: "Share your audit link with your team or CFO. Implement changes immediately." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="flex gap-6 items-start p-6 rounded-2xl border border-white/5 bg-[#0d0d0d] hover:border-white/10 transition-colors"
              >
                <span className="text-3xl font-bold text-white/10 font-mono shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-violet-950/20 p-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to find your savings?
            </h2>
            <p className="text-white/40 mb-8">
              Free forever. No account needed. Results in 3 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/audit">
                <Button size="lg">
                  Start Free Audit <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/25">
              {["No login", "No credit card", "Instant results"].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white/40">SpendLens by Credex</span>
          </div>
          <p className="text-xs text-white/20">
            Pricing data verified January 2025. Not financial advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
