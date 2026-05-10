"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Moon, Heart, Zap, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RecoveryPage() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => {
        setReadiness(d.readinessHistory || []);
      });
    fetch("/api/checkin")
      .then(r => r.json())
      .then(setCheckIns);
  }, []);

  const latest = checkIns[0];
  const latestReadiness = readiness[0];

  const readinessChart = [...readiness].reverse().map((s, i) => ({
    day: `Day ${i + 1}`,
    overall: s.overall,
    sleep: s.sleepScore,
    hr: s.hrRecoveryScore,
  }));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Recovery Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm">Monitor recovery trends and readiness</p>
      </div>

      {/* Readiness Gauge */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={`${
          latestReadiness?.zone === "green" ? "bg-emerald-500/5 border-emerald-500/20" :
          latestReadiness?.zone === "yellow" ? "bg-amber-500/5 border-amber-500/20" :
          "bg-red-500/5 border-red-500/20"
        } border lg:col-span-1`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-6xl font-bold text-zinc-100 mb-2">
              {latestReadiness?.overall || "--"}
            </div>
            <p className="text-sm text-zinc-400 mb-1">Readiness Score</p>
            <Badge className={`${
              latestReadiness?.zone === "green" ? "bg-emerald-500/20 text-emerald-400" :
              latestReadiness?.zone === "yellow" ? "bg-amber-500/20 text-amber-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {latestReadiness?.zone?.toUpperCase() || "NO DATA"}
            </Badge>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader><CardTitle className="text-sm text-zinc-300">Score Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1"><Moon className="h-3 w-3" /> Sleep</span>
                <span>{latestReadiness?.sleepScore || 0}/100</span>
              </div>
              <Progress value={latestReadiness?.sleepScore || 0} className="h-2 [&>div]:bg-indigo-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> HR Recovery</span>
                <span>{latestReadiness?.hrRecoveryScore || 0}/100</span>
              </div>
              <Progress value={latestReadiness?.hrRecoveryScore || 0} className="h-2 [&>div]:bg-rose-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Energy</span>
                <span>{latestReadiness?.energyScore || 0}/100</span>
              </div>
              <Progress value={latestReadiness?.energyScore || 0} className="h-2 [&>div]:bg-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Soreness Recovery</span>
                <span>{latestReadiness?.sorenessScore || 0}/100</span>
              </div>
              <Progress value={latestReadiness?.sorenessScore || 0} className="h-2 [&>div]:bg-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Pain Penalty</span>
                <span>{latestReadiness?.painPenalty || 0}/100</span>
              </div>
              <Progress value={latestReadiness?.painPenalty || 0} className="h-2 [&>div]:bg-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      {readinessChart.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> 14-Day Readiness Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={readinessChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                <Line type="monotone" dataKey="overall" stroke="#22c55e" strokeWidth={2.5} name="Overall" dot />
                <Line type="monotone" dataKey="sleep" stroke="#818cf8" strokeWidth={1.5} name="Sleep" dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="hr" stroke="#f87171" strokeWidth={1.5} name="HR Recovery" dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sleep & HR History */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-sm text-zinc-300">Sleep History</CardTitle></CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No check-in data</p>
            ) : (
              <div className="space-y-3">
                {checkIns.slice(0, 7).map((c, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-100">{c.sleepHours}h</p>
                      <p className="text-[10px] text-zinc-500">{new Date(c.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${c.sleepQuality! >= 7 ? "text-emerald-400" : c.sleepQuality! >= 5 ? "text-amber-400" : "text-red-400"}`}>
                        Quality {c.sleepQuality}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-sm text-zinc-300">RHR & HRV Trends</CardTitle></CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No check-in data</p>
            ) : (
              <div className="space-y-3">
                {checkIns.slice(0, 7).map((c, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-100">{c.restingHeartRate || "N/A"} bpm</p>
                      <p className="text-[10px] text-zinc-500">{new Date(c.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`text-xs font-medium ${c.restingHeartRate && c.restingHeartRate <= 55 ? "text-emerald-400" : c.restingHeartRate && c.restingHeartRate <= 65 ? "text-amber-400" : "text-red-400"}`}>
                        {c.restingHeartRate <= 55 ? "Optimal" : c.restingHeartRate <= 65 ? "Normal" : "Elevated"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
