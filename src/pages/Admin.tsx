import { useState } from "react";

const WORKER_URL = "https://ze-mailer.houseofze.workers.dev";

type Signup = {
    name: string;
    email: string;
    tier: string;
    city: string;
    note: string;
    code: string;
    timestamp: string;
};

const TIER_COLORS: Record<string, string> = {
    general: "bg-zinc-700 text-zinc-200",
    vip: "bg-rose-900 text-rose-200",
    exhibitor: "bg-amber-900 text-amber-200",
    sponsor: "bg-yellow-700 text-yellow-100",
};

export const Admin = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [signups, setSignups] = useState<Signup[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [authed, setAuthed] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${WORKER_URL}/admin?password=${encodeURIComponent(password)}`);
            if (res.status === 401) {
                setError("Incorrect password.");
                setLoading(false);
                return;
            }
            const data = await res.json() as { signups: Signup[]; total: number };
            setSignups(data.signups);
            setTotal(data.total);
            setAuthed(true);
        } catch {
            setError("Failed to connect. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "all" ? signups : signups.filter((s) => s.tier === filter);

    const tierCount = (t: string) => signups.filter((s) => s.tier === t).length;

    if (!authed) {
        return (
            <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#c9a96e] mb-6">Zë · Admin</p>
                    <h1 className="font-serif text-4xl text-[#f0ede6] mb-10">Signups</h1>
                    <form onSubmit={login} className="space-y-6">
                        <div className="border-b border-[#f0ede6]/20 focus-within:border-[#c9a96e] transition-colors flex items-center gap-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="flex-1 bg-transparent outline-none py-3 text-[#f0ede6] font-serif text-lg placeholder:text-[#f0ede6]/30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#f0ede6]/40 hover:text-[#f0ede6] transition-colors text-xs tracking-widest uppercase"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {error && <p className="text-sm text-rose-400">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#c9a96e] text-[#0e0e0e] text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#f0ede6] transition-colors"
                        >
                            {loading ? "Checking…" : "Enter"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-[#f0ede6] px-6 py-12 md:px-12">
            <div className="max-w-[1200px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-[11px] tracking-[0.25em] uppercase text-[#c9a96e] mb-3">Zë · Admin</p>
                        <h1 className="font-serif text-5xl">Waitlist</h1>
                    </div>
                    <div className="text-right">
                        <p className="font-serif text-5xl text-[#c9a96e]">{total}</p>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-[#f0ede6]/50 mt-1">Total signups</p>
                    </div>
                </div>

                {/* Tier summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {["general", "vip", "exhibitor", "sponsor"].map((t) => (
                        <div key={t} className="border border-[#f0ede6]/10 p-5">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/50">{t}</p>
                            <p className="font-serif text-4xl mt-2">{tierCount(t)}</p>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {["all", "general", "vip", "exhibitor", "sponsor"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors ${filter === t
                                ? "bg-[#c9a96e] text-[#0e0e0e]"
                                : "border border-[#f0ede6]/15 text-[#f0ede6]/60 hover:border-[#f0ede6]/40"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="border border-[#f0ede6]/10 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#f0ede6]/10">
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Name</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Email</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Tier</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">City</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Note</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Pass</th>
                                <th className="text-left px-6 py-4 text-[10px] tracking-[0.2em] uppercase text-[#f0ede6]/40 font-normal">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#f0ede6]/30 font-serif text-lg">
                                        No signups yet.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s.code} className="border-b border-[#f0ede6]/5 hover:bg-[#f0ede6]/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-serif text-base">{s.name}</td>
                                        <td className="px-6 py-4 text-[#f0ede6]/70">{s.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase rounded-sm ${TIER_COLORS[s.tier] ?? "bg-zinc-700 text-zinc-200"}`}>
                                                {s.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#f0ede6]/60">{s.city || "—"}</td>
                                        <td className="px-6 py-4 text-[#f0ede6]/60 max-w-[200px] truncate">{s.note || "—"}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-[#c9a96e]">{s.code}</td>
                                        <td className="px-6 py-4 text-[#f0ede6]/40 text-xs">
                                            {new Date(s.timestamp).toLocaleDateString("en-GB", {
                                                day: "numeric", month: "short", year: "numeric",
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};