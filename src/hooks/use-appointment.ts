"use client";

import { getAppointments, getBookedTimeSlots, updateAppointmentStatus } from "@/lib/actions/appointments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAppointments() {
  const result = useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });

  return result;
}

export function useBookedTimeSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ["getBookedTimeSlots"],
    queryFn: () => getBookedTimeSlots(doctorId!, date),
    enabled: !!doctorId && !!date, // only run query if both doctorId and date are provided
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      doctorId: string;
      date: string;
      time: string;
      reason?: string;
    }) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to book appointment");
      }

      const data = await response.json();
      return data.appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
    },
    onError: (error) => console.error("Failed to book appointment:", error),
  });
}

// Get user-specific appointments
export function useUserAppointments() {
  const result = useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: async () => {
      const response = await fetch("/api/appointments/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user appointments");
      }
      const data = await response.json();
      return data.appointments;
    },
  });

  return result;
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error) => console.error("Failed to update appointment:", error),
  });
}
