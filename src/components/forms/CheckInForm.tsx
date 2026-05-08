"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

export function CheckInForm() {
  const [formData, setFormData] = useState({
    sleepHours: "",
    sleepQuality: 5,
    restingHeartRate: "",
    bodyweight: "",
    energyLevel: 5,
    motivation: 5,
    soreness: 3,
    hydrationHit: false,
    proteinHit: false,
    mobilityCompleted: false,
    mood: "neutral",
    stressLevel: 5,
    groinPain: 0,
    lowerBackPain: 0,
    shoulderPain: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log("Submitting:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sleep */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Sleep</CardTitle>
            <CardDescription>Recovery starts here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Hours</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="7.5"
                value={formData.sleepHours}
                onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Quality: {formData.sleepQuality}/10</Label>
              <Slider
                value={[formData.sleepQuality]}
                onValueChange={(v) => setFormData({ ...formData, sleepQuality: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Metrics */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Physical Metrics</CardTitle>
            <CardDescription>Body data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Resting Heart Rate (bpm)</Label>
              <Input
                type="number"
                placeholder="55"
                value={formData.restingHeartRate}
                onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Bodyweight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={formData.bodyweight}
                onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Energy & Mood */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Energy & Mood</CardTitle>
            <CardDescription>Mental state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Energy: {formData.energyLevel}/10</Label>
              <Slider
                value={[formData.energyLevel]}
                onValueChange={(v) => setFormData({ ...formData, energyLevel: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Motivation: {formData.motivation}/10</Label>
              <Slider
                value={[formData.motivation]}
                onValueChange={(v) => setFormData({ ...formData, motivation: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Stress: {formData.stressLevel}/10</Label>
              <Slider
                value={[formData.stressLevel]}
                onValueChange={(v) => setFormData({ ...formData, stressLevel: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Mood</Label>
              <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="good" className="text-zinc-100">Good</SelectItem>
                  <SelectItem value="neutral" className="text-zinc-100">Neutral</SelectItem>
                  <SelectItem value="bad" className="text-zinc-100">Bad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recovery & Nutrition */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recovery & Nutrition</CardTitle>
            <CardDescription>Daily targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Hydration target hit</Label>
              <input
                type="checkbox"
                checked={formData.hydrationHit}
                onChange={(e) => setFormData({ ...formData, hydrationHit: e.target.checked })}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Protein target hit</Label>
              <input
                type="checkbox"
                checked={formData.proteinHit}
                onChange={(e) => setFormData({ ...formData, proteinHit: e.target.checked })}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Mobility completed</Label>
              <input
                type="checkbox"
                checked={formData.mobilityCompleted}
                onChange={(e) => setFormData({ ...formData, mobilityCompleted: e.target.checked })}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Soreness: {formData.soreness}/10</Label>
              <Slider
                value={[formData.soreness]}
                onValueChange={(v) => setFormData({ ...formData, soreness: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pain Tracking */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pain Tracking
            </CardTitle>
            <CardDescription>Monitor potential injuries</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-zinc-300">Groin/Adductor: {formData.groinPain}/10</Label>
              <Slider
                value={[formData.groinPain]}
                onValueChange={(v) => setFormData({ ...formData, groinPain: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Lower Back: {formData.lowerBackPain}/10</Label>
              <Slider
                value={[formData.lowerBackPain]}
                onValueChange={(v) => setFormData({ ...formData, lowerBackPain: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Shoulder: {formData.shoulderPain}/10</Label>
              <Slider
                value={[formData.shoulderPain]}
                onValueChange={(v) => setFormData({ ...formData, shoulderPain: v[0] })}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-100">Notes</CardTitle>
            <CardDescription>Anything else to track?</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="How are you feeling today?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button type="submit" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          Submit Check-In
        </Button>
      </div>
    </form>
  );
}
