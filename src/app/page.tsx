import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">GRITIER</h1>
        <p className="text-zinc-500 text-sm">Hybrid Athlete Command Center</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-100 text-zinc-900 font-bold text-sm hover:bg-zinc-200 transition-colors"
          >
            Open Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 font-bold text-sm hover:border-zinc-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
