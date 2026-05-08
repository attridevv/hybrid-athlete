"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles, Target, Shield, TrendingUp, Clock } from "lucide-react";

const DEMO_USER_ID = "demo-user";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/insights?userId=${DEMO_USER_ID}`).then(r => r.json()).then(setInsights);
  }, []);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: DEMO_USER_ID }),
      });
      const data = await res.json();
      setGenerated(data);
      setInsights(prev => [data, ...prev]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">AI Coach</h1>
          <p className="text-zinc-500 mt-1 text-sm">Intelligent performance analysis and guidance</p>
        </div>
        <Button onClick={generateInsight} disabled={loading}
          className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {loading ? "Analyzing..." : "Generate Report"}
        </Button>
      </div>

      {/* Latest Generated Insight */}
      {(generated || insights[0]) && (
        <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-400" />
              {generated ? "New Analysis" : "Latest Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {(generated?.content || insights[0]?.content || "No insights yet. Click 'Generate Report' to analyze your data.")}
              </div>
            </div>

            {(generated || insights[0])?.metadata && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").readinessScore && (
                  <Badge className="bg-zinc-800 text-zinc-400">
                    Readiness: {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").readinessScore}/100
                  </Badge>
                )}
                {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").acwr && (
                  <Badge className="bg-zinc-800 text-zinc-400">
                    ACWR: {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").acwr}
                  </Badge>
                )}
                {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").injuryRiskScore && (
                  <Badge className="bg-zinc-800 text-zinc-400">
                    Injury Risk: {JSON.parse(generated?.metadata || insights[0]?.metadata || "{}").injuryRiskScore}/100
                  </Badge>
                )}
              </div>
            )}

            {(generated || insights[0])?.recommendations && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Recommendations</p>
                {JSON.parse(generated?.recommendations || insights[0]?.recommendations || "[]").map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <Target className="h-3 w-3 mt-0.5 text-blue-400 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historical Insights */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Previous Reports</h2>
        {insights.length <= 1 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center text-zinc-500">
              <Brain className="h-8 w-8 mx-auto mb-2 text-zinc-700" />
              <p>No previous reports. Generate your first AI analysis.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {insights.slice(1).map((insight, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/10 text-blue-400">
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {new Date(insight.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {insight.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
