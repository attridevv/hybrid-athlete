"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, TrendingUp, Plus, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DEMO_USER_ID = "demo-user";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: "strength",
    duration: 60,
    rpe: 7,
    notes: "",
  });
  const [exForm, setExForm] = useState({
    name: "Back Squat",
    category: "squat",
    weight: 100,
    sets: 4,
    reps: 8,
    rpe: 8,
    tempo: "3-1-1-0",
    painNotes: "",
    fatigueNotes: "",
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });
  const updateEx = (k: string, v: any) => setExForm({ ...exForm, [k]: v });

  const addExercise = () => {
    setExercises(prev => [...prev, { ...exForm }]);
    setExForm({ name: "", category: "squat", weight: 0, sets: 3, reps: 10, rpe: 7, tempo: "", painNotes: "", fatigueNotes: "" });
  };

  const logWorkout = async () => {
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: DEMO_USER_ID, ...form, exercises }),
      });
      const data = await res.json();
      setWorkouts(prev => [data, ...prev]);
      setExercises([]);
    } catch (err) {
      console.error(err);
    }
  };

  const weeklyVolume = workouts
    .filter(w => new Date(w.date).getTime() > Date.now() - 7 * 86400000)
    .reduce((s, w) => s + (w.totalVolume || 0), 0);

  const volumeChart = [...workouts].reverse().map((w, i) => ({
    name: `W${i + 1}`,
    volume: w.totalVolume || 0,
    exercises: w.exercises?.length || 0,
  }));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Strength Tracker</h1>
        <p className="text-zinc-500 mt-1 text-sm">Track strength sessions and volume progression</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Weekly Volume</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-zinc-100">{weeklyVolume.toLocaleString()} kg</div></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Sessions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-zinc-100">{workouts.length}</div></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Avg RPE</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {workouts.length > 0 ? (workouts.reduce((s, w) => s + (w.rpe || 0), 0) / workouts.length).toFixed(1) : "--"}/10
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Total KG</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {workouts.reduce((s, w) => s + (w.totalVolume || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      {volumeChart.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-sm text-zinc-300">Volume Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Log */}
      <Tabs defaultValue="log">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="log" className="data-[state=active]:bg-zinc-800 text-xs"><Plus className="h-3 w-3 mr-1" />Log Workout</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 text-xs"><Calendar className="h-3 w-3 mr-1" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4 space-y-4">
          {/* Workout Meta */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-100">Session Details</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs text-zinc-400">Type</Label>
                <Select value={form.type} onValueChange={v => update("type", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="mobility">Mobility</SelectItem>
                    <SelectItem value="crossTraining">Cross Training</SelectItem>
                    <SelectItem value="rehab">Rehab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Duration (min)</Label>
                <Input type="number" value={form.duration} onChange={e => update("duration", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Session RPE</Label>
                <Input type="number" min={1} max={10} value={form.rpe} onChange={e => update("rpe", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </CardContent>
          </Card>

          {/* Exercise Form */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-100">Add Exercise</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs text-zinc-400">Name</Label>
                <Input value={exForm.name} onChange={e => updateEx("name", e.target.value)} placeholder="Back Squat" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Category</Label>
                <Select value={exForm.category} onValueChange={v => updateEx("category", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="hinge">Hinge</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="pull">Pull</SelectItem>
                    <SelectItem value="carry">Carry</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-zinc-400">Weight (kg)</Label><Input type="number" value={exForm.weight} onChange={e => updateEx("weight", parseFloat(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">Sets</Label><Input type="number" value={exForm.sets} onChange={e => updateEx("sets", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">Reps</Label><Input type="number" value={exForm.reps} onChange={e => updateEx("reps", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">RPE</Label><Input type="number" min={1} max={10} value={exForm.rpe} onChange={e => updateEx("rpe", parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">Tempo</Label><Input value={exForm.tempo} onChange={e => updateEx("tempo", e.target.value)} placeholder="3-1-1-0" className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">Pain Notes</Label><Input value={exForm.painNotes} onChange={e => updateEx("painNotes", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
              <div><Label className="text-xs text-zinc-400">Fatigue Notes</Label><Input value={exForm.fatigueNotes} onChange={e => updateEx("fatigueNotes", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            </CardContent>
          </Card>
          <Button type="button" onClick={addExercise} variant="outline" className="w-full border-zinc-700 text-zinc-300">Add Exercise</Button>

          {/* Exercise List */}
          {exercises.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500 uppercase">Exercises ({exercises.length})</Label>
              {exercises.map((ex, i) => (
                <Card key={i} className="bg-zinc-800/50 border-zinc-700">
                  <CardContent className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{ex.name}</p>
                      <p className="text-xs text-zinc-500">{ex.sets}x{ex.reps} @ {ex.weight}kg • RPE {ex.rpe}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">1RM: ~{ex.weight && ex.reps ? Math.round(ex.weight * (1 + ex.reps / 30)) : "--"}kg</p>
                      <p className="text-xs text-zinc-500">{ex.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExercises(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300">
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button onClick={logWorkout} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Log Workout</Button>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {workouts.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800"><CardContent className="py-12 text-center text-zinc-500">No workouts logged yet.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {workouts.map((w, i) => (
                <Card key={i} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-100 capitalize">{w.type}</p>
                        <p className="text-xs text-zinc-500">{w.duration} min • RPE {w.rpe}/10</p>
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">{(w.totalVolume || 0).toLocaleString()} kg</p>
                    </div>
                    {w.exercises?.length > 0 && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-zinc-800">
                        {w.exercises.map((ex: any, j: number) => (
                          <div key={j} className="flex justify-between text-xs">
                            <span className="text-zinc-400">{ex.name} ({ex.sets}x{ex.reps})</span>
                            <span className="text-zinc-500">{ex.weight}kg • ~{ex.estimated1RM}kg 1RM</span>
                          </div>
                        ))}
                      </div>
                    )}
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
