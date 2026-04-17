import React, { useEffect, useState } from "react";
import { Button } from "./components/ui/button";

interface Complaint {
  id: number;
  pgr_ticket_id: string | null;
  service_code: string;
  workflow: string;
  pgr_status: string;
  created_date: string;
}

export default function IssueListPopup({
  onClose,
}: {
  onClose: () => void;
}) {
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("care_access_token");

      const res = await fetch(
        "http://localhost:9000/api/care_digit_integration/pgr/complaints/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.detail || "Failed to fetch complaints");
      }
      
      const filteredData = (json?.results || []).filter((item: Complaint) => {
  console.log("Checking workflow:", item.workflow); // debug
  return item.workflow?.toLowerCase() === "system";
});

      setData(json?.results || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_ASSIGNMENT":
        return "bg-yellow-100 text-yellow-700";
      case "sync_failed":
        return "bg-red-100 text-red-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[900px] max-w-full shadow-2xl relative">

        {/* Close Button */}
        <Button
          className="absolute top-3 right-3"
          variant="ghost"
          onClick={onClose}
        >
          ✕
        </Button>

        <h2 className="text-xl font-semibold mb-4">
          Issues / Complaints List
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-gray-500">Loading complaints...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-auto max-h-[500px] border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Ticket ID</th>
                  <th className="p-2 text-left">Service Code</th>
                  <th className="p-2 text-left">Workflow</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Created Date</th>
                </tr>
              </thead>

              <tbody>
                {data
  .filter((item) => item.workflow?.toLowerCase() === "system") // 🔥 FORCE FILTER
  .map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">

                    <td className="p-2">
                      {item.pgr_ticket_id || "-"}
                    </td>

                    <td className="p-2">
                      {item.service_code}
                    </td>

                    <td className="p-2">
                      {item.workflow}
                    </td>

                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                          item.pgr_status
                        )}`}
                      >
                        {item.pgr_status}
                      </span>
                    </td>

                    <td className="p-2">
                      {new Date(item.created_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {data.length === 0 && (
              <p className="p-4 text-center text-gray-500">
                No complaints found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}