"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Moon, Heart, Brain, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckInPage() {
  const [submitted, setSubmitted] = useState(false);
  const [readiness, setReadiness] = useState<any>(null);
  const [form, setForm] = useState({
    sleepHours: 7.5,
    sleepQuality: 6,
    restingHeartRate: 55,
    bodyweight: 75,
    energyLevel: 7,
    motivation: 6,
    mood: "neutral",
    stressLevel: 4,
    soreness: 4,
    hydrationHit: true,
    proteinHit: true,
    mobilityCompleted: true,
    steps: 8500,
    groinPain: 2,
    lowerBackPain: 1,
    shoulderPain: 0,
    kneePain: 0,
    hamstringTightness: 3,
    notes: "",
  });

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });
  const getSliderValue = (value: number | readonly number[]) => Array.isArray(value) ? value[0] : value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setReadiness(data.readiness);
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted && readiness) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-md mx-auto text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Check-In Complete</h1>
          
          <Card className={`${
            readiness.zone === "green" ? "bg-emerald-500/10 border-emerald-500/20" :
            readiness.zone === "yellow" ? "bg-amber-500/10 border-amber-500/20" :
            "bg-red-500/10 border-red-500/20"
          } border mt-6`}>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold mb-2 text-zinc-100">{readiness.overall}</div>
              <p className="text-zinc-400 text-sm">Readiness Score</p>
              <div className="mt-4 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Sleep</span>
                  <span className="text-zinc-100">{readiness.sleepScore}/100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">HR Recovery</span>
                  <span className="text-zinc-100">{readiness.hrRecoveryScore}/100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Energy</span>
                  <span className="text-zinc-100">{readiness.energyScore}/100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Zone</span>
                  <span className={`capitalize ${
                    readiness.zone === "green" ? "text-emerald-400" :
                    readiness.zone === "yellow" ? "text-amber-400" : "text-red-400"
                  }`}>{readiness.zone}</span>
                </div>
              </div>
              {readiness.insights?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
                  {readiness.insights.map((i: string, idx: number) => (
                    <p key={idx} className="text-xs text-zinc-400">{i}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6 border-zinc-700 text-zinc-300">
            New Check-In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Daily Check-In</h1>
        <p className="text-zinc-500 mt-1 text-sm">Track your readiness and recovery data</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="sleep" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 h-auto p-1 flex-wrap">
            <TabsTrigger value="sleep" className="data-[state=active]:bg-zinc-800 text-xs"><Moon className="h-3 w-3 mr-1" />Sleep</TabsTrigger>
            <TabsTrigger value="physical" className="data-[state=active]:bg-zinc-800 text-xs"><Heart className="h-3 w-3 mr-1" />Physical</TabsTrigger>
            <TabsTrigger value="energy" className="data-[state=active]:bg-zinc-800 text-xs"><Zap className="h-3 w-3 mr-1" />Energy</TabsTrigger>
            <TabsTrigger value="recovery" className="data-[state=active]:bg-zinc-800 text-xs"><Activity className="h-3 w-3 mr-1" />Recovery</TabsTrigger>
            <TabsTrigger value="pain" className="data-[state=active]:bg-zinc-800 text-xs"><Brain className="h-3 w-3 mr-1" />Pain</TabsTrigger>
          </TabsList>

          {/* Sleep */}
          <TabsContent value="sleep">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100 text-sm">Sleep Duration</CardTitle>
                  <CardDescription>Hours slept last night</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input type="number" step="0.5" value={form.sleepHours} onChange={e => update("sleepHours", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg" />
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100 text-sm">Sleep Quality</CardTitle>
                  <CardDescription>{form.sleepQuality}/10</CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider value={[form.sleepQuality]} onValueChange={v => update("sleepQuality", getSliderValue(v))} max={10} step={1} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Physical */}
          <TabsContent value="physical">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Resting Heart Rate</CardTitle></CardHeader>
                <CardContent>
                  <Input type="number" value={form.restingHeartRate} onChange={e => update("restingHeartRate", parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg" />
                  <p className="text-xs text-zinc-500 mt-1">BPM</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Bodyweight</CardTitle></CardHeader>
                <CardContent>
                  <Input type="number" step="0.1" value={form.bodyweight} onChange={e => update("bodyweight", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg" />
                  <p className="text-xs text-zinc-500 mt-1">kg</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Steps</CardTitle></CardHeader>
                <CardContent>
                  <Input type="number" value={form.steps} onChange={e => update("steps", parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Energy & Mood */}
          <TabsContent value="energy">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Energy: {form.energyLevel}/10</CardTitle></CardHeader>
                <CardContent><Slider value={[form.energyLevel]} onValueChange={v => update("energyLevel", getSliderValue(v))} max={10} step={1} /></CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Motivation: {form.motivation}/10</CardTitle></CardHeader>
                <CardContent><Slider value={[form.motivation]} onValueChange={v => update("motivation", getSliderValue(v))} max={10} step={1} /></CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Stress: {form.stressLevel}/10</CardTitle></CardHeader>
                <CardContent><Slider value={[form.stressLevel]} onValueChange={v => update("stressLevel", getSliderValue(v))} max={10} step={1} /></CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Mood</CardTitle></CardHeader>
                <CardContent>
                  <Select value={form.mood} onValueChange={v => update("mood", v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recovery */}
          <TabsContent value="recovery">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Soreness: {form.soreness}/10</CardTitle></CardHeader>
                <CardContent><Slider value={[form.soreness]} onValueChange={v => update("soreness", getSliderValue(v))} max={10} step={1} /></CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-zinc-100 text-sm">Daily Targets</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-300">Hydration target</span>
                    <input type="checkbox" checked={form.hydrationHit} onChange={e => update("hydrationHit", e.target.checked)}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 accent-emerald-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-300">Protein target</span>
                    <input type="checkbox" checked={form.proteinHit} onChange={e => update("proteinHit", e.target.checked)}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 accent-emerald-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-300">Mobility done</span>
                    <input type="checkbox" checked={form.mobilityCompleted} onChange={e => update("mobilityCompleted", e.target.checked)}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 accent-emerald-500" />
                  </label>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pain Tracking */}
          <TabsContent value="pain">
            <div className="space-y-4">
              {[
                { key: "groinPain", label: "Groin/Adductor" },
                { key: "lowerBackPain", label: "Lower Back" },
                { key: "shoulderPain", label: "Shoulder" },
                { key: "kneePain", label: "Knee" },
                { key: "hamstringTightness", label: "Hamstring" },
              ].map(({ key, label }) => (
                <Card key={key} className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm text-zinc-100">{label}: {(form as any)[key]}/10</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Slider value={[(form as any)[key]]} onValueChange={v => update(key, getSliderValue(v))} max={10} step={1} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-zinc-600">No pain</span>
                      <span className={`text-[10px] font-medium ${
                        (form as any)[key] > 6 ? "text-red-400" : (form as any)[key] > 3 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {(form as any)[key] > 6 ? "High" : (form as any)[key] > 3 ? "Moderate" : "Low"}
                      </span>
                      <span className="text-[10px] text-zinc-600">Severe</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <Card className="bg-zinc-900 border-zinc-800 mt-6">
          <CardHeader><CardTitle className="text-sm text-zinc-100">Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea placeholder="How are you feeling? Any observations..."
              value={form.notes} onChange={e => update("notes", e.target.value)}
              className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none" />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full mt-6 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-12 text-sm font-semibold">
          Submit Check-In
        </Button>
      </form>
    </div>
  );
}
