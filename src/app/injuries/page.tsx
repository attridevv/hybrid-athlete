"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, Clipboard, Bell } from "lucide-react";

export default function InjuriesPage() {
  const [injuries, setInjuries] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>(null);
  const [form, setForm] = useState({
    location: "groin",
    side: "right",
    severity: 3,
    status: "active",
    type: "strain",
    mechanism: "",
    notes: "",
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });
  const getSliderValue = (value: number | readonly number[]) => Array.isArray(value) ? value[0] : value;

  useEffect(() => {
    fetch("/api/injuries").then(r => r.json()).then(setInjuries);
    // Get analytics for injury risk
    fetch("/api/analytics").then(r => r.json()).then(d => {
      if (d.load) setRisk(d);
    });
  }, []);

  const reportInjury = async () => {
    try {
      const res = await fetch("/api/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setInjuries(prev => [data, ...prev]);
    } catch (err) { console.error(err); }
  };

  const resolveInjury = async (id: string) => {
    try {
      await fetch("/api/injuries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "recovered" }),
      });
      setInjuries(prev => prev.map(i => i.id === id ? { ...i, status: "recovered" } : i));
    } catch (err) { console.error(err); }
  };

  const activeCount = injuries.filter(i => i.status === "active" || i.status === "monitoring").length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Injury Monitoring</h1>
        <p className="text-zinc-500 mt-1 text-sm">Track, monitor, and manage injuries</p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Active</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{injuries.filter(i => i.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Monitoring</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{injuries.filter(i => i.status === "monitoring").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Recovered</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{injuries.filter(i => i.status === "recovered").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400 uppercase">Risk Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeCount > 0 ? "↑" : "Low"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="report">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="report" className="data-[state=active]:bg-zinc-800 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Report</TabsTrigger>
          <TabsTrigger value="tracker" className="data-[state=active]:bg-zinc-800 text-xs"><Clipboard className="h-3 w-3 mr-1" />Tracker ({injuries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-100">Report Injury</CardTitle><CardDescription>Document new or worsening injury</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-zinc-400">Location</Label>
                <Select value={form.location} onValueChange={v => update("location", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="groin">Groin/Adductor</SelectItem>
                    <SelectItem value="lowerBack">Lower Back</SelectItem>
                    <SelectItem value="shoulder">Shoulder</SelectItem>
                    <SelectItem value="knee">Knee</SelectItem>
                    <SelectItem value="hamstring">Hamstring</SelectItem>
                    <SelectItem value="ankle">Ankle</SelectItem>
                    <SelectItem value="hip">Hip</SelectItem>
                    <SelectItem value="wrist">Wrist</SelectItem>
                    <SelectItem value="elbow">Elbow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Side</Label>
                <Select value={form.side} onValueChange={v => update("side", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="bilateral">Bilateral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Type</Label>
                <Select value={form.type} onValueChange={v => update("type", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="strain">Muscle Strain</SelectItem>
                    <SelectItem value="tendinopathy">Tendinopathy</SelectItem>
                    <SelectItem value="contusion">Contusion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Status</Label>
                <Select value={form.status} onValueChange={v => update("status", v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-zinc-400">Severity: {form.severity}/10</Label>
                <Slider value={[form.severity]} onValueChange={v => update("severity", getSliderValue(v))} max={10} step={1} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-600">Mild</span>
                  <span className={`text-[10px] font-medium ${form.severity > 6 ? "text-red-400" : form.severity > 3 ? "text-amber-400" : "text-emerald-400"}`}>
                    {form.severity > 6 ? "Severe" : form.severity > 3 ? "Moderate" : "Mild"}
                  </span>
                  <span className="text-[10px] text-zinc-600">Severe</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-zinc-400">Mechanism (how it happened)</Label>
                <Input value={form.mechanism} onChange={e => update("mechanism", e.target.value)} placeholder="e.g. During sprint intervals..." className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-zinc-400">Notes</Label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Pain description, aggravating factors..."
                  className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none" />
              </div>
            </CardContent>
          </Card>
          <Button onClick={reportInjury} className="w-full mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Report Injury</Button>
        </TabsContent>

        <TabsContent value="tracker" className="mt-4">
          {injuries.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800"><CardContent className="py-12 text-center text-zinc-500">No injuries reported</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {injuries.map((injury, i) => (
                <Card key={i} className={`bg-zinc-900 border ${
                  injury.status === "active" ? "border-red-500/30" :
                  injury.status === "monitoring" ? "border-amber-500/30" :
                  "border-emerald-500/30"
                }`}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        injury.status === "active" ? "bg-red-500/10" :
                        injury.status === "monitoring" ? "bg-amber-500/10" :
                        "bg-emerald-500/10"
                      }`}>
                        {injury.status === "recovered" 
                          ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                          : <AlertTriangle className={`h-4 w-4 ${injury.status === "active" ? "text-red-400" : "text-amber-400"}`} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100 capitalize">{injury.location.replace(/([A-Z])/g, " $1").trim()}</p>
                        <p className="text-xs text-zinc-500">{injury.side} • {injury.type} • Severity {injury.severity}/10</p>
                        {injury.notes && <p className="text-xs text-zinc-400 mt-1">{injury.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        injury.status === "active" ? "bg-red-500/20 text-red-400" :
                        injury.status === "monitoring" ? "bg-amber-500/20 text-amber-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      }>
                        {injury.status}
                      </Badge>
                      {injury.status !== "recovered" && (
                        <Button variant="outline" size="sm" onClick={() => resolveInjury(injury.id)}
                          className="border-zinc-700 text-xs h-7">Resolve</Button>
                      )}
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
