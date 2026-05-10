"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Footprints, Calendar, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [weekCutoff] = useState(() => Date.now() - 7 * 86400000);
  const [form, setForm] = useState({
    distance: 8,
    duration: 2400, // 40 min in seconds
    pace: 5.0,
    avgHr: 145,
    maxHr: 172,
    cadence: 175,
    elevation: 45,
    rpe: 6,
    type: "easy",
    terrain: "road",
    notes: "",
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const addRun = async () => {
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setRuns(prev => [data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const weeklyMileage = runs
    .filter(r => new Date(r.date).getTime() > weekCutoff)
    .reduce((s, r) => s + r.distance, 0);

  const chartData = [...runs].reverse().map((r, i) => ({
    name: `Run ${i + 1}`,
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
              {runs.length > 0 ? (runs.reduce((s, r) => s + (r.pace || 0), 0) / runs.length).toFixed(1) : "--"}/km
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Efficiency</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {runs.length > 0 ? (runs[0]?.efficiency || "--") : "--"}
            </div>
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

      {/* Run Log */}
      <Tabs defaultValue="log">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="log" className="data-[state=active]:bg-zinc-800 text-xs"><Plus className="h-3 w-3 mr-1" />Log Run</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 text-xs"><Calendar className="h-3 w-3 mr-1" />History ({runs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-sm text-zinc-100">Performance</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <Label className="text-zinc-400 text-xs">Distance (km)</Label>
                  <Input type="number" step="0.1" value={form.distance} onChange={e => update("distance", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Duration (s)</Label>
                    <Input type="number" value={form.duration} onChange={e => update("duration", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Pace (min/km)</Label>
                    <Input type="number" step="0.1" value={form.pace} onChange={e => update("pace", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-sm text-zinc-100">Heart Rate</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Avg HR (bpm)</Label>
                    <Input type="number" value={form.avgHr} onChange={e => update("avgHr", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Max HR (bpm)</Label>
                    <Input type="number" value={form.maxHr} onChange={e => update("maxHr", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Cadence (spm)</Label>
                    <Input type="number" value={form.cadence} onChange={e => update("cadence", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Elevation (m)</Label>
                    <Input type="number" value={form.elevation} onChange={e => update("elevation", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-sm text-zinc-100">Effort & Context</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Type</Label>
                    <Select value={form.type} onValueChange={v => update("type", v)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
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
                    <Label className="text-zinc-400 text-xs">Terrain</Label>
                    <Select value={form.terrain} onValueChange={v => update("terrain", v)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="trail">Trail</SelectItem>
                        <SelectItem value="track">Track</SelectItem>
                        <SelectItem value="treadmill">Treadmill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">RPE (1-10)</Label>
                  <Input type="number" min={1} max={10} value={form.rpe} onChange={e => update("rpe", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Notes</Label>
                  <Input value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="How did it feel?" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Button onClick={addRun} className="w-full mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Log Run</Button>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {runs.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center text-zinc-500">No runs logged yet. Start tracking!</CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {runs.map((run, i) => (
                <Card key={i} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{run.distance} km • {(run.duration / 60).toFixed(0)} min</p>
                      <p className="text-xs text-zinc-500">{run.type} • {run.terrain} • RPE {run.rpe}/10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-300">{run.pace}/km</p>
                      <p className="text-xs text-zinc-500">HR {run.avgHr} bpm</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
