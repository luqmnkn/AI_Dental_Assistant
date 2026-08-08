"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BrainIcon, MessageSquareIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";

function DentalHealthOverview() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    recordsCount: 0,
    streakCount: 0,
  });
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments/stats").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/records").then((r) => r.json()),
      fetch("/api/habits").then((r) => r.json()),
    ])
      .then(([appStats, userData, recordsData, habitsData]) => {
        // Calculate streak
        let streak = 0;
        if (habitsData?.logs && habitsData.logs.length > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayLog = habitsData.logs.find((log: any) => log.date === todayStr);
          if (todayLog) {
            streak = todayLog.streakCount;
          } else {
            streak = habitsData.logs[habitsData.logs.length - 1].streakCount;
          }
        }

        setStats({
          totalAppointments: appStats.totalAppointments || 0,
          completedAppointments: appStats.completedAppointments || 0,
          recordsCount: recordsData?.records?.length || 0,
          streakCount: streak || 0,
        });
        setUserCreatedAt(userData?.user?.createdAt || null);
      })
      .catch((err) => {
        console.error("Error fetching overview stats:", err);
      });
  }, []);

  return (
    <Card className="lg:col-span-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainIcon className="size-5 text-primary" />
          Your Dental Health & EHR
        </CardTitle>
        <CardDescription>Keep track of your dental care journey and active records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.completedAppointments}
            </div>
            <div className="text-xs text-muted-foreground">Completed Visits</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.recordsCount}
            </div>
            <div className="text-xs text-muted-foreground">Clinical Records</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-2xl font-bold text-orange-500 mb-1">
              🔥 {stats.streakCount}d
            </div>
            <div className="text-xs text-muted-foreground">Daily Habit Streak</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-1">
              {userCreatedAt ? format(new Date(userCreatedAt), "MMM yyyy") : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Member Since</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquareIcon className="size-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">Ready to get started?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use your personalized daily habit checklist below to maintain healthy teeth, or consult our AI voice assistant.
              </p>
              <div className="flex gap-2">
                <Link href="/voice">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
                    Try AI Assistant
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button size="sm" variant="outline" className="rounded-xl">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DentalHealthOverview;
