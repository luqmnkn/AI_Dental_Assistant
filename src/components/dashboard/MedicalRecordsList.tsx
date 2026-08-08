"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ClipboardList, Calendar, UserRound, RefreshCw, Eye, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  visitDate: string;
  doctorName: string;
  doctorSpeciality: string;
  doctorImageUrl: string;
}

function MedicalRecordsList() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/records");
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      r.treatment.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="shadow-lg border border-border/80 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          Treatment & Prescription History
        </CardTitle>
        <CardDescription>Your clinical history, diagnoses, and treatments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search diagnosis, treatment, or doctor..."
            className="pl-9 h-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin" />
            <span>Loading medical records...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl border-border/60">
            <ClipboardList className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No medical records found.</p>
            <p className="text-xs mt-1">Records are created by doctors after your visits.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl border border-border/60 hover:border-primary/40 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full overflow-hidden shrink-0 border border-border">
                    <Image
                      src={record.doctorImageUrl || "/default-avatar.png"}
                      alt={record.doctorName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{record.diagnosis}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <UserRound className="size-3" /> Dr. {record.doctorName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {record.visitDate}
                      </span>
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1.5" onClick={() => setSelectedRecord(record)}>
                      <Eye className="size-3.5" />
                      <span>Details</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Clinical Record Details</DialogTitle>
                      <DialogDescription>
                        Complete diagnostic and treatment information of your visit
                      </DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/40">
                          <div className="relative size-12 rounded-full overflow-hidden shrink-0 border border-border">
                            <Image
                              src={selectedRecord.doctorImageUrl || "/default-avatar.png"}
                              alt={selectedRecord.doctorName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Dr. {selectedRecord.doctorName}</h4>
                            <p className="text-xs text-muted-foreground">{selectedRecord.doctorSpeciality}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Visit Date: {selectedRecord.visitDate}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                              Diagnosis
                            </span>
                            <p className="text-sm font-medium mt-0.5 text-foreground">{selectedRecord.diagnosis}</p>
                          </div>

                          <div className="h-px bg-border/60" />

                          <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                              Treatment Administered / Recommended
                            </span>
                            <p className="text-sm mt-0.5 text-foreground leading-relaxed">
                              {selectedRecord.treatment}
                            </p>
                          </div>

                          {selectedRecord.prescription && (
                            <>
                              <div className="h-px bg-border/60" />
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                  Prescription Details
                                </span>
                                <div className="mt-1 p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm font-mono text-primary leading-relaxed">
                                  {selectedRecord.prescription}
                                </div>
                              </div>
                            </>
                          )}

                          {selectedRecord.notes && (
                            <>
                              <div className="h-px bg-border/60" />
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                  Doctor's Care Notes
                                </span>
                                <p className="text-sm mt-0.5 text-muted-foreground italic leading-relaxed">
                                  "{selectedRecord.notes}"
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicalRecordsList;
