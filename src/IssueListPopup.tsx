import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "./components/ui/button";

import { I18NNAMESPACE } from "@/lib/constants";
import { apis_new } from "@/apis";

import type { Complaint } from "@/types/complaint";

export default function IssueListPopup({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation(I18NNAMESPACE);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-complaints"],
    queryFn: () => apis_new.complaints.list(),
    select: (res) => ({
      ...res,
      results: (res.results || []).filter(
        (item) => item.workflow?.toLowerCase() === "system",
      ),
    }),
  });

  const complaints = data?.results ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_ASSIGNMENT":
        return "bg-yellow-100 text-yellow-700";

      case "SYNC_FAILED":
        return "bg-red-100 text-red-700";

      case "RESOLVED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[900px] max-w-full rounded-xl bg-white p-6 shadow-2xl">
        <Button
          className="absolute right-3 top-3"
          variant="ghost"
          onClick={onClose}
        >
          ✕
        </Button>

        <h2 className="mb-4 text-xl font-semibold">
          {t("Complaints List")}
        </h2>

        {isLoading && (
          <p className="text-gray-500">
            {t("Loading complaints")}
          </p>
        )}

        {isError && (
          <p className="text-red-500">
            {t("Error fetching complaints")}
          </p>
        )}

        {!isLoading && !isError && (
          <div className="max-h-[500px] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2 text-left">
                    {t("Ticket ID")}
                  </th>

                  <th className="p-2 text-left">
                    {t("Service Code")}
                  </th>

                  <th className="p-2 text-left">
                    {t("Workflow")}
                  </th>

                  <th className="p-2 text-left">
                    {t("Status")}
                  </th>

                  <th className="p-2 text-left">
                    {t("Created Date")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((item: Complaint) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-2">
                      {item.pgr_ticket_id || "-"}
                    </td>

                    <td className="p-2">
                      {t(item.service_code, item.service_code)}
                    </td>

                    <td className="p-2">
                      {t(item.workflow, item.workflow)}
                    </td>

                    <td className="p-2">
                      <span
                        className={`rounded px-2 py-1 text-xs ${getStatusColor(
                          item.pgr_status,
                        )}`}
                      >
                        {t(item.pgr_status, item.pgr_status)}
                      </span>
                    </td>

                    <td className="p-2">
                      {new Date(item.created_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!complaints.length && (
              <p className="p-4 text-center text-gray-500">
                {t("No complaints found")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
