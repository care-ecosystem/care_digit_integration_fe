import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ListIcon,
  ChevronLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  CircleDotIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { navigate } from "raviger";
import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
import type { Complaint } from "@/types/complaint";
import { Card, CardContent } from "@/components/ui/card";

const statusConfig: Record<
  string,
  { label: string; icon: FC<{ className?: string }>; classes: string }
> = {
  OPEN: {
    label: "Open",
    icon: CircleDotIcon,
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  PENDING_ASSIGNMENT: {
    label: "Assignment Pending",
    icon: CircleDotIcon,
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  in_progress: {
    label: "In Progress",
    icon: ClockIcon,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  assigned: {
    label: "Assigned",
    icon: ClockIcon,
    classes: "bg-purple-50 text-purple-700 border-purple-200",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2Icon,
    classes: "bg-green-50 text-green-700 border-green-200",
  },
  pending_sync: {
    label: "Pending Sync",
    icon: ClockIcon,
    classes: "bg-orange-50 text-orange-700 border-orange-200",
  },
  sync_failed: {
    label: "Sync Failed",
    icon: CircleDotIcon,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

interface ComplaintListPageProps {
  patientId?: string;
}

const ComplaintListPage: FC<ComplaintListPageProps> = ({ patientId }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const [page, setPage] = useState(1);

  const goBack = () => {
    navigate(patientId ? `/patient/${patientId}/complaints` : "/complaints");
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["complaints", patientId, page],
    queryFn: () =>
      apis.complaints.list(
        patientId ? { patient: patientId, page } : { page }
      ),
    keepPreviousData: true,
  });

  const totalPages = data?.count
    ? Math.ceil(data.count / 10)
    : 1;

  return (
    <div className="care-issue-management-fe-container">
      <div className="mx-auto max-w-2xl w-full px-4 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            aria-label={t("back")}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              {t("all_complaints")}
            </h2>
            <p className="text-xs text-secondary-500 mt-0.5">
              {t("list_subtitle")}
            </p>
          </div>
        </div>

        <div className="border-t border-secondary-200" />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-secondary-200" />
                  <div className="h-3 w-3/4 rounded bg-secondary-100" />
                  <div className="h-3 w-1/4 rounded bg-secondary-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="px-4 py-6 text-center">
              <p className="text-sm text-red-600">
                {t("complaints_load_error")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !isError && !data?.results?.length && (
          <Card className="border-dashed border-secondary-300 text-center">
            <CardContent className="px-4 py-10">
              <ListIcon className="mx-auto mb-2 size-8 text-secondary-400" />
              <p className="text-sm font-medium text-secondary-600">
                {t("no_complaints")}
              </p>
              <p className="mt-1 text-xs text-secondary-400">
                {t("no_complaints_hint")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* List */}
        {!isLoading && !isError && !!data?.results?.length && (
          <>
            <ul className="space-y-3">
              {data.results.map((c: Complaint) => {
                const cfg = statusConfig[c.pgr_status] ?? statusConfig["OPEN"];
                const Icon = cfg.icon;
                const displayTitle = c.title ?? c.service_code;

                return (
                  <li key={c.id}>
                    <Card className="transition-shadow hover:shadow-sm">
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-medium text-secondary-900 leading-snug">
                            {displayTitle}
                          </span>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.classes}`}
                          >
                            <Icon className="size-3" />
                            {cfg.label}
                          </span>
                        </div>

                        {c.description && (
                          <p className="text-xs text-secondary-500 leading-relaxed">
                            {c.description}
                          </p>
                        )}

                        {c.pgr_ticket_id && (
                          <p className="text-xs text-secondary-400">
                            Ticket #{c.pgr_ticket_id}
                          </p>
                        )}

                        <p className="text-xs text-secondary-400">
                          {new Date(c.created_date).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.previous}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              <span className="text-xs text-secondary-500">
                Page {page} of {totalPages}
                {isFetching && (
                  <span className="ml-2 text-secondary-400">(Loading...)</span>
                )}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintListPage;