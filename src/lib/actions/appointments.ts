"use server";

import { prisma } from "../prisma";
import { AppointmentStatus } from "@prisma/client";
import { getUserFromServer } from "../auth";

function transformAppointment(appointment: any) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

export async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.log("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getUserAppointments(userId?: string) {
  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await getUserFromServer();
    }

    if (!user) throw new Error("You must be logged in to view appointments");

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

export async function getUserAppointmentStats(userId?: string) {
  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await getUserFromServer();
    }

    if (!user) throw new Error("You must be authenticated");

    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({ where: { userId: user.id } }),
      prisma.appointment.count({ where: { userId: user.id, status: "COMPLETED" } }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["CONFIRMED", "COMPLETED"], // consider both confirmed and completed appointments as blocking
        },
      },
      select: { time: true },
    });

    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return []; // return empty array if there's an error
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

export async function bookAppointment(input: BookAppointmentInput, userId?: string) {
  // console.log("Booking appointment with input:", input, "for userId:", userId);
  try {
    // try to resolve the user server-side if a userId wasn't provided
    let user = null;
    if (!userId) {
      user = await getUserFromServer();
      if (!user) throw new Error("You must be logged in to book an appointment");
    } else {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }
    if (!user) throw new Error("User not found. Please ensure your account is properly set up.");
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: new Date(input.date),
        time: input.time,
        reason: input.reason || "General consultation",
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
    });
// console.log("New appointment booked:", appointment);
    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

export async function updateAppointmentStatus(input: { id: string; status: AppointmentStatus }) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    return appointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
}
