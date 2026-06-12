"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "1 mint/month",
      "Text input only",
      "Basic certificate (watermarked)",
      "Public verification page",
    ],
    cta: "Get Started",
    href: "/",
    highlight: false,
  },
  {
    key: "creator",
    name: "Creator",
    price: "$9.99",
    period: "per month",
    features: [
      "10 mints/month",
      "Text + file upload (up to 10MB)",
      "Clean PDF certificate",
      "Private verification option",
      "Email confirmation + receipt",
    ],
    cta: "Start Creator",
    highlight: true,
  },
  {
    key: "founder",
    name: "Founder",
    price: "$29",
    period: "per month",
    features: [
      "50 mints/month",
      "3 team seats",
      "All file types (up to 50MB)",
      "Priority processing",
      "Bulk export (ZIP)",
      "Custom certificate branding",
    ],
    cta: "Start Founder",
    highlight: false,
  },
  {
    key: "agency",
    name: "Agency / API",
    price: "$99",
    period: "per month",
    features: [
      "500 mints/month",
      "Full REST API access",
      "Webhook support",
      "White-label certificates",
      "CSV export",
      "SLA support",
    ],
    cta: "Start Agency",
    highlight: false,
  },
] as const;

export default function PricingTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "free") {
      router.push("/");
      return;
    }

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/pricing`);
      return;
    }

    setLoading(planKey);
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {PLANS.map((plan) => (
        <div
          key={plan.key}
          className={`rounded-2xl p-6 flex flex-col relative ${
            plan.highlight
              ? "border-2 border-black shadow-lg"
              : "border border-gray-200"
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
            </div>
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleUpgrade(plan.key)}
            disabled={loading === plan.key}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${
              plan.highlight
                ? "bg-black text-white hover:bg-gray-800"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {loading === plan.key ? "Loading..." : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
