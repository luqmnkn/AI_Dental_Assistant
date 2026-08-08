"use client"

import DentalHealthOverview from "./DentalHealthOverview";
import NextAppointment from "./NextAppointment";
import HabitTracker from "./HabitTracker";
import MedicalRecordsList from "./MedicalRecordsList";

function ActivityOverview() {
  return (
    <div className="space-y-6">
      {/* Overview Cards row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <DentalHealthOverview />
        <NextAppointment />
      </div>

      {/* Patient EHR Portal (Habits + Medical Records) row */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <HabitTracker />
        </div>
        <div className="lg:col-span-3">
          <MedicalRecordsList />
        </div>
      </div>
    </div>
  );
}
export default ActivityOverview;
