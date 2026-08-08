"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Circle, Sparkles, Flame, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface HabitLog {
  id?: string;
  date: string;
  brushMorning: boolean;
  brushNight: boolean;
  floss: boolean;
  mouthwash: boolean;
  streakCount: number;
}

const HABITS = [
  { key: "brushMorning", label: "Brush Morning", description: "Clean your teeth when waking up", icon: "☀️" },
  { key: "brushNight", label: "Brush Night", description: "Clean your teeth before bed", icon: "🌙" },
  { key: "floss", label: "Floss", description: "Clean between your teeth once a day", icon: "🧵" },
  { key: "mouthwash", label: "Mouthwash", description: "Rinse with mouthwash once a day", icon: "🧴" },
] as const;

function HabitTracker() {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        // Find today's log or latest log for streak
        const todayLog = data.logs.find((log: HabitLog) => log.date === todayStr);
        if (todayLog) {
          setStreak(todayLog.streakCount);
        } else if (data.logs.length > 0) {
          // If no today log, maybe yesterday has the streak
          setStreak(data.logs[data.logs.length - 1].streakCount);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch habits log");
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitState = async (habitKey: typeof HABITS[number]["key"]) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit: habitKey, date: todayStr }),
      });
      const data = await res.json();
      if (data.log) {
        // Update local logs
        setLogs((prev) => {
          const index = prev.findIndex((l) => l.date === todayStr);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = data.log;
            return copy;
          } else {
            return [...prev, data.log];
          }
        });
        setStreak(data.log.streakCount);
        toast.success(`Updated ${habitKey === "brushMorning" || habitKey === "brushNight" ? "Brushing" : habitKey}!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update habit");
    }
  };

  const getTodayHabitState = (habitKey: typeof HABITS[number]["key"]) => {
    const todayLog = logs.find((log) => log.date === todayStr);
    return todayLog ? todayLog[habitKey] : false;
  };

  const calculateCompletionPercentage = () => {
    const todayLog = logs.find((log) => log.date === todayStr);
    if (!todayLog) return 0;
    let completedCount = 0;
    if (todayLog.brushMorning) completedCount++;
    if (todayLog.brushNight) completedCount++;
    if (todayLog.floss) completedCount++;
    if (todayLog.mouthwash) completedCount++;
    return Math.round((completedCount / 4) * 100);
  };

  const completionPercent = calculateCompletionPercentage();

  return (
    <Card className="shadow-lg border border-border/80 h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="size-5 text-primary animate-pulse" />
              Dental Habits Tracker
            </CardTitle>
            <CardDescription>Stay on top of your daily hygiene routine</CardDescription>
          </div>

          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full font-mono font-semibold text-sm border border-orange-500/20">
            <Flame className="size-4 fill-orange-500 text-orange-500" />
            <span>{streak} Day Streak</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin" />
            <span>Loading habits...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Today's Progress</span>
                <span className="font-semibold text-primary">{completionPercent}%</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Habit Items */}
            <div className="grid gap-3">
              {HABITS.map((habit) => {
                const completed = getTodayHabitState(habit.key);
                return (
                  <button
                    key={habit.key}
                    onClick={() => toggleHabitState(habit.key)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      completed
                        ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{habit.label}</h4>
                        <p className="text-xs text-muted-foreground">{habit.description}</p>
                      </div>
                    </div>

                    <div>
                      {completed ? (
                        <CheckCircle2 className="size-6 text-primary fill-primary/10" />
                      ) : (
                        <Circle className="size-6 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HabitTracker;
