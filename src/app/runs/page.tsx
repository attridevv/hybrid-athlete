"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, Calendar, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function durationToSeconds(min: number, sec: number) {
  return (min * 60) + sec;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [weekCutoff] = useState(() => Date.now() - 7 * 86400000);
  const [form, setForm] = useState({
    distance: "8",
    durationMin: "40",
    durationSec: "0",
    pace: "",
    avgHr: "",
    maxHr: "",
    cadence: "",
    elevation: "",
    rpe: "6",
    type: "easy",
    terrain: "road",
    notes: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) throw new Error("Failed to load runs");
      const data = await res.json();
      setRuns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Could not load runs");
    }
    setLoading(false);
  };

  const addRun = async () => {
    setSaving(true);
    setError(null);
    try {
      const dist = parseFloat(form.distance) || 0;
      const durSec = durationToSeconds(parseInt(form.durationMin) || 0, parseInt(form.durationSec) || 0);
      const paceVal = form.pace ? parseFloat(form.pace) : dist > 0 && durSec > 0 ? Math.round((durSec / 60 / dist) * 100) / 100 : null;

      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distance: dist,
          duration: durSec,
          pace: paceVal,
          avgHr: form.avgHr ? parseInt(form.avgHr) : null,
          maxHr: form.maxHr ? parseInt(form.maxHr) : null,
          cadence: form.cadence ? parseInt(form.cadence) : null,
          elevation: form.elevation ? parseInt(form.elevation) : null,
          rpe: parseInt(form.rpe) || null,
          type: form.type,
          terrain: form.terrain,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save run");
      }

      const data = await res.json();
      setRuns(prev => [data, ...prev]);
      setSuccess(true);
      setForm({ distance: "8", durationMin: "40", durationSec: "0", pace: "", avgHr: "", maxHr: "", cadence: "", elevation: "", rpe: "6", type: "easy", terrain: "road", notes: "" });
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to log run. Try again.");
    }
    setSaving(false);
  };

  const weeklyMileage = runs.filter(r => new Date(r.date).getTime() > weekCutoff).reduce((s, r) => s + (r.distance || 0), 0);

  const chartData = [...runs].reverse().slice(-10).map((r, i) => ({
    name: `${i + 1}`,
    distance: r.distance,
    pace: r.pace,
    avgHr: r.avgHr,
  }));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Running Tracker</h1>
        <p className="text-zinc-500 mt-1 text-sm">Log runs and track endurance progression</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={runs.length === 0 ? fetchRuns : () => setError(null)} className="mt-1 text-xs text-zinc-400 hover:text-zinc-200 underline">
              {runs.length === 0 ? "Retry" : "Dismiss"}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="h-4 w-4" /> Run logged successfully
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Weekly Distance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-zinc-100">{Math.round(weeklyMileage * 10) / 10} km</div></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Total Runs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-zinc-100">{runs.length}</div></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Avg Pace</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {runs.length > 0 ? (runs.filter(r => r.pace).length > 0 ? (runs.filter(r => r.pace).reduce((s, r) => s + r.pace, 0) / runs.filter(r => r.pace).length).toFixed(1) : "--") : "--"}/km
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Efficiency</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{runs.length > 0 && runs[0]?.efficiency ? runs[0].efficiency.toFixed(3) : "--"}</div>
            <p className="text-[10px] text-zinc-500">pace/HR ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {runs.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-sm text-zinc-300">Pace & HR Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#22c55e" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="pace" stroke="#22c55e" strokeWidth={2} name="Pace (min/km)" dot />
                <Line yAxisId="right" type="monotone" dataKey="avgHr" stroke="#ef4444" strokeWidth={2} name="Avg HR (bpm)" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Log Run Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2"><Plus className="h-4 w-4" /> Log Run</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300 block mb-2">Distance (km)</label>
            <input type="number" step="0.1" min="0" value={form.distance} onChange={e => update("distance", e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Duration (min)</label>
              <input type="number" min="0" max="1440" value={form.durationMin} onChange={e => update("durationMin", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Duration (sec)</label>
              <input type="number" min="0" max="59" value={form.durationSec} onChange={e => update("durationSec", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Avg HR (optional)</label>
              <input type="number" min="30" max="250" value={form.avgHr} onChange={e => update("avgHr", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="150" />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Max HR (optional)</label>
              <input type="number" min="30" max="250" value={form.maxHr} onChange={e => update("maxHr", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="175" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Type</label>
              <Select value={form.type} onValueChange={v => update("type", v ?? "easy")}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="intervals">Intervals</SelectItem>
                  <SelectItem value="longRun">Long Run</SelectItem>
                  <SelectItem value="recovery">Recovery</SelectItem>
                  <SelectItem value="race">Race</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-2">RPE (1-10)</label>
              <input type="number" min="1" max="10" value={form.rpe} onChange={e => update("rpe", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-300 block mb-2">Notes (optional)</label>
            <input value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="How did it feel? Route, weather..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>

          <Button onClick={addRun} disabled={saving} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-12 text-base font-semibold">
            {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Plus className="h-5 w-5 mr-2" />}
            {saving ? "Saving..." : "Log Run"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {loading && runs.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-600 mx-auto" /></CardContent></Card>
      )}
      {runs.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-sm text-zinc-300 flex items-center gap-2"><Calendar className="h-4 w-4" /> History ({runs.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runs.slice(0, 20).map((r, i) => (
                <div key={i} className="flex justify-between items-center py-3 px-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">{r.distance}km</span>
                      <span className="text-[10px] text-zinc-500 capitalize bg-zinc-700 px-2 py-0.5 rounded">{r.type}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {Math.floor((r.duration || 0) / 60)}:{String((r.duration || 0) % 60).padStart(2, "0")} &middot;
                      {r.pace ? ` ${r.pace}/km` : " --"} &middot;
                      {r.avgHr ? ` HR ${r.avgHr}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400">{new Date(r.date).toLocaleDateString()}</span>
                    {r.rpe && <span className="text-xs text-zinc-500 block">RPE {r.rpe}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && runs.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="py-12 text-center text-zinc-500">No runs logged yet. Start tracking!</CardContent></Card>
      )}
    </div>
  );
}
