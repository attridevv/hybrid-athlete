"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Heart, BarChart3, Target, Zap, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

const DEMO_USER_ID = "demo-user";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/analytics?userId=${DEMO_USER_ID}`).then(r => r.json()).then(setData);
    fetch(`/api/runs?userId=${DEMO_USER_ID}`).then(r => r.json()).then(setRuns);
    fetch(`/api/checkin?userId=${DEMO_USER_ID}`).then(r => r.json()).then(setCheckIns);
  }, []);

  const readiness = data?.readiness;
  const load = data?.load;

  // Pace trend data
  const paceTrend = [...runs].reverse().map((r, i) => ({
    day: i + 1,
    pace: r.pace || 0,
    hr: r.avgHr || 0,
    efficiency: r.efficiency || 0,
  }));

  // Sleep trend
  const sleepTrend = [...checkIns].reverse().slice(-14).map((c, i) => ({
    day: i + 1,
    hours: c.sleepHours || 0,
    quality: c.sleepQuality || 0,
  }));

  // Load bar chart
  const loadTrend = data?.trainingLoadHistory?.reverse()?.map((t: any, i: number) => ({
    day: i + 1,
    load: t.load || 0,
    rpe: t.sessionRPE || 0,
  })) || [];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-zinc-500 mt-1 text-sm">Deep-dive into your performance data</p>
      </div>

      {/* Aerobic Efficiency */}
      {paceTrend.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" /> Aerobic Efficiency (Pace vs HR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={paceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#22c55e" fontSize={11} label={{ value: "Pace", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} label={{ value: "HR", angle: 90, position: "insideRight" }} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="pace" stroke="#22c55e" strokeWidth={2} dot={false} name="Pace (min/km)" />
                <Line yAxisId="right" type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg HR (bpm)" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-zinc-500 mt-2">Lower HR at same pace = improved aerobic efficiency</p>
          </CardContent>
        </Card>
      )}

      {/* Training Load & Sleep */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" /> Training Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={loadTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                  <Bar dataKey="load" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Session Load" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-zinc-600 text-sm">No load data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" /> Sleep Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sleepTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={sleepTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="hours" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} strokeWidth={2} name="Sleep Hours" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-zinc-600 text-sm">No sleep data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Consistency Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {data ? Math.round((data.weeklyRuns + data.weeklyWorkouts + (data.mobilityCompliance / 100 * 7)) / 3 * 10) : "--"}%
            </div>
            <p className="text-xs text-zinc-500">Weekly training consistency</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Chronic Load</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{load?.chronicLoad || "--"}</div>
            <p className="text-xs text-zinc-500">28-day rolling average</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Fatigue Index</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(load?.fatigueIndex || 0) > 70 ? "text-amber-400" : "text-emerald-400"}`}>
              {load?.fatigueIndex || "--"}/100
            </div>
            <p className="text-xs text-zinc-500">Current fatigue accumulation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
