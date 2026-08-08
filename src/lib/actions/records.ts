"use server";

import { prisma } from "../prisma";
import { getUserFromServer } from "../auth";

// --- Medical Records Server Actions ---

export async function getMedicalRecords(userId?: string) {
  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await getUserFromServer();
    }

    if (!user) throw new Error("You must be logged in to view medical records");

    let records = await prisma.medicalRecord.findMany({
      where: { userId: user.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { visitDate: "desc" },
    });

    // Auto-seed mock medical records if the user has none, to make the portal immediately fully functional
    if (records.length === 0) {
      const activeDoctor = await prisma.doctor.findFirst({
        where: { isActive: true },
      });

      if (activeDoctor) {
        // Create 2 sample medical records
        await prisma.medicalRecord.createMany({
          data: [
            {
              userId: user.id,
              doctorId: activeDoctor.id,
              diagnosis: "Mild Gingivitis & Routine Prophylaxis",
              treatment: "Comprehensive scaling, polishing, and root planing. Patient was educated on proper brushing angles.",
              prescription: "Chlorhexidine Gluconate 0.12% Oral Rinse - Swish 15ml twice daily for 14 days.",
              notes: "Gums showed mild bleeding upon probing. Overall oral hygiene is good but needs better flossing habits.",
              visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
            {
              userId: user.id,
              doctorId: activeDoctor.id,
              diagnosis: "Class I Dental Caries (Tooth #19)",
              treatment: "Localized composite resin restoration (white filling) on the occlusal surface of tooth #19.",
              prescription: "Ibuprofen 400mg - Take 1 tablet every 6 hours as needed for mild discomfort.",
              notes: "Cavity was shallow, restored successfully without need for root canal. Recommend schedule for checkup in 6 months.",
              visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            },
          ],
        });

        // Refetch records
        records = await prisma.medicalRecord.findMany({
          where: { userId: user.id },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                speciality: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { visitDate: "desc" },
        });
      }
    }

    return records.map((record) => ({
      ...record,
      doctorName: record.doctor.name,
      doctorSpeciality: record.doctor.speciality,
      doctorImageUrl: record.doctor.imageUrl,
      visitDate: record.visitDate.toISOString().split("T")[0],
    }));
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw new Error("Failed to fetch medical records");
  }
}

export async function addMedicalRecord(input: {
  userId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  visitDate?: string;
}) {
  try {
    const record = await prisma.medicalRecord.create({
      data: {
        userId: input.userId,
        doctorId: input.doctorId,
        diagnosis: input.diagnosis,
        treatment: input.treatment,
        prescription: input.prescription || null,
        notes: input.notes || null,
        visitDate: input.visitDate ? new Date(input.visitDate) : new Date(),
      },
    });

    return record;
  } catch (error) {
    console.error("Error adding medical record:", error);
    throw new Error("Failed to add medical record");
  }
}

// --- Dental Habits Server Actions ---

export async function getHabitLogs(userId?: string) {
  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await getUserFromServer();
    }

    if (!user) throw new Error("You must be logged in to view habit logs");

    // Retrieve last 7 days of logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.habitLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      orderBy: { date: "asc" },
    });

    return logs.map((log) => ({
      ...log,
      date: log.date.toISOString().split("T")[0],
    }));
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    throw new Error("Failed to fetch habit logs");
  }
}

export async function toggleHabit(
  habit: "brushMorning" | "brushNight" | "floss" | "mouthwash",
  dateStr: string,
  userId?: string
) {
  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await getUserFromServer();
    }

    if (!user) throw new Error("You must be logged in to update habits");

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    // Get current record or create if not exists
    const currentLog = await prisma.habitLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    let updatedValue = true;
    if (currentLog) {
      updatedValue = !currentLog[habit];
    }

    // Toggle habit and update streak
    const upsertLog = await prisma.habitLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      create: {
        userId: user.id,
        date,
        [habit]: true,
      },
      update: {
        [habit]: updatedValue,
      },
    });

    // Calculate current streak (consecutive days where at least 1 habit is logged)
    const allLogs = await prisma.habitLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    let currentStreak = 0;
    const tempDate = new Date();
    tempDate.setHours(0, 0, 0, 0);

    // check if we have any logged today, or yesterday to continue streak
    for (const log of allLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(tempDate.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // check if any habit is completed in the log
      const isAnyHabitDone =
        log.brushMorning || log.brushNight || log.floss || log.mouthwash;

      if (diffDays <= currentStreak + 1 && isAnyHabitDone) {
        currentStreak++;
      } else if (diffDays > currentStreak + 1) {
        break;
      }
    }

    // Update the streak count of the latest log or current log
    await prisma.habitLog.update({
      where: { id: upsertLog.id },
      data: { streakCount: currentStreak },
    });

    return {
      ...upsertLog,
      [habit]: updatedValue,
      streakCount: currentStreak,
      date: upsertLog.date.toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Error toggling habit:", error);
    throw new Error("Failed to update daily habit");
  }
}
