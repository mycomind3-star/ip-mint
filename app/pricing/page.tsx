import { PLANS } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          IP<span className="text-yellow-500">MINT</span>
        </a>
        <a href="/auth/signin" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          Sign In
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, honest pricing.
          </h1>
          <p className="text-gray-500 text-lg">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Free</h3>
              <div className="text-3xl font-bold mt-2">$0</div>
              <div className="text-gray-500 text-sm">forever</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 mint/month</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Text only</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic certificate (watermarked)</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Public verification page</li>
            </ul>
            <a href="/" className="block text-center py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Get Started
            </a>
          </div>

          {/* Creator — highlighted */}
          <div className="border-2 border-black rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Creator</h3>
              <div className="text-3xl font-bold mt-2">$9.99</div>
              <div className="text-gray-500 text-sm">per month</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
              {PLANS.creator.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton plan="creator" label="Start Creator" primary />
          </div>

          {/* Founder */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Founder</h3>
              <div className="text-3xl font-bold mt-2">$29</div>
              <div className="text-gray-500 text-sm">per month</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
              {PLANS.founder.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton plan="founder" label="Start Founder" />
          </div>

          {/* Agency */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Agency / API</h3>
              <div className="text-3xl font-bold mt-2">$99</div>
              <div className="text-gray-500 text-sm">per month</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
              {PLANS.agency.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton plan="agency" label="Start Agency" />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          All paid plans include a 7-day free trial. Cancel anytime. Platform covers blockchain gas fees.
        </p>
      </div>
    </main>
  );
}

function UpgradeButton({
  plan,
  label,
  primary,
}: {
  plan: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action="/api/subscription/checkout" method="POST">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
          primary
            ? "bg-black text-white hover:bg-gray-800"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
