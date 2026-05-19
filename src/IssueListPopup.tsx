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
  // const [page, setPage] = useState(1);

  // const limit = 10;
  // const offset = (page - 1) * limit;


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

  // const totalPages = data?.count ? Math.ceil(data.count / 10) : 1;

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

// import React, { useEffect, useState } from "react";
// import { Button } from "./components/ui/button";
// import { useTranslation } from "react-i18next"; // :white_check_mark: ADDED
// import { I18NNAMESPACE } from "@/lib/constants"; // :white_check_mark: ADDED
// import type { Complaint } from "@/types/complaint";
// // interface Complaint {
// //   id: number;
// //   pgr_ticket_id: string | null;
// //   service_code: string;
// //   workflow: string;
// //   pgr_status: string;
// //   created_date: string;
// // }

// export default function IssueListPopup({ onClose }: { onClose: () => void }) {
//   const [data, setData] = useState<Complaint[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { t } = useTranslation(I18NNAMESPACE); // :white_check_mark: ADDED
//   const fetchComplaints = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const token = localStorage.getItem("care_access_token");

//       const res = await fetch(
//         "http://localhost:9000/api/care_digit_integration/pgr/complaints/",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token && {
//               Authorization: `Bearer ${token}`,
//             }),
//           },
//         },
//       );

//       const json = await res.json();

//       if (!res.ok) {
//         throw new Error(json?.detail || "Failed to fetch complaints");
//       }
//       // :white_check_mark: FIXED: actually use filtered data const filteredData = (json?.results || []).filter( (item: Complaint) => item.workflow?.toLowerCase() === "system" );
//       const filteredData = (json?.results || []).filter(
//         (item: Complaint) => item.workflow?.toLowerCase() === "system",
//       );

//       setData(filteredData); // :red_circle: FIXED
//     } catch (err: any) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "PENDING_ASSIGNMENT":
//         return "bg-yellow-100 text-yellow-700";
//       case "sync_failed":
//         return "bg-red-100 text-red-700";
//       case "RESOLVED":
//         return "bg-green-100 text-green-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 w-[900px] max-w-full shadow-2xl relative">
//         {/* Close Button */}
//         <Button
//           className="absolute top-3 right-3"
//           variant="ghost"
//           onClick={onClose}
//         >
//           ✕
//         </Button>

//         <h2 className="text-xl font-semibold mb-4">{t("Complaints List")}</h2>

//         {/* :red_circle: CHANGE 2: translated loading */}
//         {loading && <p className="text-gray-500">{t("Loading complaints")}</p>}

//         {/* :red_circle: CHANGE 3: translated error */}
//         {error && (
//           <p className="text-red-500">{t("Error fetching complaints")}</p>
//         )}

//         {/* Table */}
//         {!loading && !error && (
//           <div className="overflow-auto max-h-[500px] border rounded-md">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="p-2 text-left">{t("Ticket ID")}</th>
//                   <th className="p-2 text-left">{t("Service Code")}</th>
//                   <th className="p-2 text-left">{t("Workflow")}</th>
//                   <th className="p-2 text-left">{t("Status")}</th>
//                   <th className="p-2 text-left">{t("Created Date")}</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {data
//                   .filter((item) => item.workflow?.toLowerCase() === "system") // :fire: FORCE FILTER
//                   .map((item) => (
//                     <tr key={item.id} className="border-t hover:bg-gray-50">
//                       <td className="p-2">{item.pgr_ticket_id || "-"}</td>

//                       <td className="p-2">
//                         {t(item.service_code, item.service_code)}
//                       </td>

//                       {/* :red_circle: CHANGE 6: WORKFLOW TRANSLATED */}
//                       <td className="p-2">{t(item.workflow, item.workflow)}</td>

//                       {/* :red_circle: CHANGE 7: STATUS TRANSLATED */}
//                       <td className="p-2">
//                         <span
//                           className={`px-2 py-1 rounded text-xs ${getStatusColor(
//                             item.pgr_status,
//                           )}`}
//                         >
//                           {t(item.pgr_status, item.pgr_status)}
//                         </span>
//                       </td>

//                       <td className="p-2">
//                         {new Date(item.created_date).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>

//             {/* :red_circle: CHANGE 8: empty state translated */}
//             {data.length === 0 && (
//               <p className="p-4 text-center text-gray-500">
//                 {t("No complaints found")}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
