"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Rocket, Dumbbell, Shield, Calendar, X, Check } from "lucide-react";

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function PlanPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [planForm, setPlanForm] = useState({
    type: "run",
    name: "",
    distance: 8,
    duration: 45,
    rpe: 6,
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const weeks = getMonthDays(year, month);

  useEffect(() => {
    fetch("/api/plan")
      .then(r => r.json())
      .then(d => setActivities(d.activities || d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/plan?month=${formatDate(year, month, 1)}`)
      .then(r => r.json())
      .then(d => setActivities(d.activities || d))
      .catch(() => {});
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const dayActivities = (day: number) => {
    const dateKey = formatDate(year, month, day);
    return activities.filter(a => a.date?.startsWith?.(dateKey));
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateKey = formatDate(year, month, day);
    setSelectedDate(dateKey);
    setShowForm(false);
  };

  const createPlan = async () => {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, ...planForm }),
    });
    const data = await res.json();
    if (res.ok) {
      setActivities(prev => [...prev, data]);
      setShowForm(false);
      setPlanForm({ type: "run", name: "", distance: 8, duration: 45, rpe: 6, notes: "" });
      setMessage("Plan saved");
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const deletePlan = async (id: string) => {
    const res = await fetch(`/api/plan?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  const today = new Date();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Training Planner</h1>
          <p className="text-zinc-500 mt-1 text-sm">Schedule runs, workouts, and recovery</p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>
      )}

      {/* Calendar */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="text-zinc-400 hover:text-zinc-100">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-zinc-100 text-lg">
              {MONTHS[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="text-zinc-400 hover:text-zinc-100">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="aspect-square" />;
                const dateKey = formatDate(year, month, day);
                const isToday = dateKey === formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = dateKey === selectedDate;
                const acts = dayActivities(day);
                const hasRun = acts.some(a => a.type === "run");
                const hasWorkout = acts.some(a => a.type === "workout");
                const hasRecovery = acts.some(a => a.type === "recovery");

                return (
                  <button
                    key={di}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-sm transition-colors relative ${
                      isToday ? "bg-zinc-800 font-bold text-zinc-100" :
                      isSelected ? "bg-blue-500/20 border border-blue-500/30 text-zinc-100" :
                      "hover:bg-zinc-800/50 text-zinc-300"
                    }`}
                  >
                    <span>{day}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {hasRun && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      {hasWorkout && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      {hasRecovery && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-zinc-300">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
              {showForm ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              {showForm ? "Cancel" : "Add Plan"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showForm && (
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Type</label>
                    <Select value={planForm.type} onValueChange={v => setPlanForm(p => ({ ...p, type: v ?? "run" }))}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="run">Run</SelectItem>
                        <SelectItem value="workout">Workout</SelectItem>
                        <SelectItem value="recovery">Recovery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Name</label>
                    <Input value={planForm.name} onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Easy run / Leg day" className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                  </div>
                  {planForm.type !== "recovery" && (
                    <>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Distance (km)</label>
                        <Input type="number" value={planForm.distance} onChange={e => setPlanForm(p => ({ ...p, distance: parseFloat(e.target.value) || 0 }))}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Duration (min)</label>
                        <Input type="number" value={planForm.duration} onChange={e => setPlanForm(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">RPE (1-10)</label>
                        <Input type="number" min={1} max={10} value={planForm.rpe} onChange={e => setPlanForm(p => ({ ...p, rpe: parseInt(e.target.value) || 1 }))}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Notes</label>
                    <Input value={planForm.notes} onChange={e => setPlanForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Route / focus" className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                  </div>
                </div>
                <Button onClick={createPlan} size="sm" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 text-sm">
                  <Check className="h-3 w-3 mr-1" /> Save Plan
                </Button>
              </div>
            )}

            {dayActivities(parseInt(selectedDate.split("-")[2])).length === 0 && !showForm && (
              <p className="text-zinc-600 text-xs text-center py-4">Nothing planned for this day</p>
            )}

            {dayActivities(parseInt(selectedDate.split("-")[2])).map((act: any) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    act.type === "run" ? "bg-emerald-500/10" :
                    act.type === "workout" ? "bg-blue-500/10" : "bg-amber-500/10"
                  }`}>
                    {act.type === "run" ? <Rocket className="h-4 w-4 text-emerald-400" /> :
                     act.type === "workout" ? <Dumbbell className="h-4 w-4 text-blue-400" /> :
                     <Shield className="h-4 w-4 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{act.name || act.type}</p>
                    <p className="text-xs text-zinc-500">
                      {act.type !== "recovery" && <>{act.distance}km · {act.duration}min · RPE {act.rpe}</>}
                      {act.notes && <span className="ml-2">— {act.notes}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    act.type === "run" ? "bg-emerald-500/10 text-emerald-400" :
                    act.type === "workout" ? "bg-blue-500/10 text-blue-400" :
                    "bg-amber-500/10 text-amber-400"
                  }>{act.type}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => deletePlan(act.id)} className="text-red-400 h-7 w-7 p-0 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
