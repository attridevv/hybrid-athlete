"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Target, Calendar, Activity, Settings, Save } from "lucide-react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    height: 178,
    weight: 75,
    bodyFat: 12,
    age: 25,
    sex: "male",
    restingHR: 52,
    vo2Max: 52,
    trainingAge: 5,
    raceGoal: "Sub-1:30 Half Marathon",
    raceDistance: "half",
    raceDate: "",
    mobilityScore: 7,
    weeklyAvailability: 10,
    recoveryCapacity: "medium",
    notes: "",
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const saveProfile = async () => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          raceDate: form.raceDate ? new Date(form.raceDate).toISOString() : undefined,
        }),
      });
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Athlete Profile</h1>
        <p className="text-zinc-500 mt-1 text-sm">Your physiological baseline and training context</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Physical */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
              <User className="h-4 w-4" /> Physical Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><Label className="text-xs text-zinc-400">Height (cm)</Label><Input type="number" value={form.height} onChange={e => update("height", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div><Label className="text-xs text-zinc-400">Weight (kg)</Label><Input type="number" value={form.weight} onChange={e => update("weight", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div><Label className="text-xs text-zinc-400">Body Fat %</Label><Input type="number" value={form.bodyFat} onChange={e => update("bodyFat", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div><Label className="text-xs text-zinc-400">Age</Label><Input type="number" value={form.age} onChange={e => update("age", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div>
              <Label className="text-xs text-zinc-400">Sex</Label>
              <Select value={form.sex} onValueChange={v => update("sex", v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-zinc-400">Resting HR (bpm)</Label><Input type="number" value={form.restingHR} onChange={e => update("restingHR", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div><Label className="text-xs text-zinc-400">VO2 Max (est.)</Label><Input type="number" value={form.vo2Max} onChange={e => update("vo2Max", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            <div><Label className="text-xs text-zinc-400">Training Age (yrs)</Label><Input type="number" value={form.trainingAge} onChange={e => update("trainingAge", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
          </CardContent>
        </Card>

        {/* Goals & Training */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
              <Target className="h-4 w-4" /> Goals & Training
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label className="text-xs text-zinc-400">Race Goal</Label>
              <Input value={form.raceGoal} onChange={e => update("raceGoal", e.target.value)} placeholder="Sub-1:30 Half" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400">Distance</Label>
                <Select value={form.raceDistance} onValueChange={v => update("raceDistance", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="5k">5K</SelectItem>
                    <SelectItem value="10k">10K</SelectItem>
                    <SelectItem value="half">Half Marathon</SelectItem>
                    <SelectItem value="marathon">Marathon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Race Date</Label>
                <Input type="date" value={form.raceDate} onChange={e => update("raceDate", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-zinc-400">Weekly Hours</Label><Input type="number" value={form.weeklyAvailability} onChange={e => update("weeklyAvailability", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div>
                <Label className="text-xs text-zinc-400">Recovery Capacity</Label>
                <Select value={form.recoveryCapacity} onValueChange={v => update("recoveryCapacity", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Mobility Score (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.mobilityScore} onChange={e => update("mobilityScore", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Notes</Label>
              <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Training philosophy, preferences..."
                className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={saveProfile} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
        <Save className="h-4 w-4 mr-2" /> Save Profile
      </Button>
    </div>
  );
}
