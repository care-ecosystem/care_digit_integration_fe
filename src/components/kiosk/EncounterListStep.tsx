import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  MessageSquarePlus,
  TagIcon,
  User,
} from "lucide-react";
import type { Encounter, Organization } from "@/types/kiosk";

interface EncounterListStepProps {
  encounters: Encounter[];
  onAddFeedback: (encounter: Encounter) => void;
  onBack: () => void;
}

const STATUS_BADGE: Record<string, "primary" | "danger" | "green" | "yellow"> =
  {
    in_progress: "yellow",
    completed: "primary",
    cancelled: "danger",
    planned: "green",
  };

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  planned: "Planned",
};

const CLASS_LABEL: Record<string, string> = {
  imp: "Inpatient",
  amb: "Ambulatory",
  emer: "Emergency",
  obs: "Observation",
  hh: "Home Health",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EncounterListStep({
  encounters,
  onAddFeedback,
  onBack,
}: EncounterListStepProps) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-8">
      <div>
        <Button variant="outline" onClick={onBack} className="mb-2 -ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="pb-4 border-b border-gray-200">
          <h4 className="font-semibold text-lg">Your Encounter</h4>
          <span className="text-sm text-gray-700">
            Your feedback helps us improve
          </span>
        </div>
      </div>

      {encounters.length > 0 && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium truncate">
              {encounters[0].patient.name}
            </p>
            <p className="text-sm text-gray-500">
              {Math.floor(
                new Date().getFullYear() - encounters[0].patient.year_of_birth,
              )}
              {" Y"} •{" "}
              {encounters[0].patient.gender?.toLocaleUpperCase()[0] +
                encounters[0].patient.gender?.slice(1)}
            </p>
          </div>
        </div>
      )}

      {encounters.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
          <ClipboardList className="h-10 w-10 text-gray-300" />
          <p className="text-sm">No encounters found for this patient.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {encounters.map((encounter) => (
          <div
            key={encounter.id}
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
          >
            {/* Header with title and status badge */}
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-gray-900">
                {encounter.facility.name}
              </span>
              <Badge
                variant={STATUS_BADGE[encounter.status] ?? "outline"}
                className="text-xs font-medium shrink-0"
              >
                {STATUS_LABEL[encounter.status] ?? encounter.status}
              </Badge>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <TagIcon className="h-4 w-4 shrink-0 text-gray-400" />
                <Badge
                  variant={STATUS_BADGE[encounter.status] ?? "outline"}
                  className="text-xs font-medium shrink-0"
                >
                  {CLASS_LABEL[encounter.encounter_class] ??
                    encounter.encounter_class}
                </Badge>
              </div>
            </div>

            {/* Facility and date info */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                <span>
                  {encounter?.organizations
                    ?.map((organization: Organization) => organization?.name)
                    .join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{formatDateTime(encounter.period.start)}</span>
              </div>
            </div>

            {/* Discharge summary */}
            {encounter.discharge_summary_advice && (
              <div className="bg-gray-50 rounded border border-gray-100 p-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {encounter.discharge_summary_advice}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 mt-auto">
              <Button
                size="sm"
                onClick={() => onAddFeedback(encounter)}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Raise Complaint
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
