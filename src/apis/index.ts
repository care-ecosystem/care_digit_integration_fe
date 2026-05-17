import { request, queryString } from "./request";
import { PaginatedResponse } from "./types";
import { Complaint } from "@/types/complaint";
import { Facility } from "@/types/facility";

export const apis = {
  complaints: {
    list: async (query?: {
      patient?: string;
      status?: string;
      page?: number;
      limit?: number;
      offset?: number;
    }) => {
      return await request<PaginatedResponse<Complaint>>(
        "/api/care_digit_integration/pgr/complaints/" + queryString(query), //+ queryString(query)
      );
    },

    get: async (id: string) => {
      return await request<Complaint>(
        `/api/care_digit_integration/pgr/complaints/${id}/`,
      );
    },

    create: async (body: any) => {
      return await request<Complaint>(
        "/api/care_digit_integration/pgr/complaints/",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
    },

    update: async (
      id: string,
      body: Partial<{ title: string; description: string; status: string }>,
    ) => {
      return await request<Complaint>(
        `/api/care_digit_integration/pgr/complaints/${id}/`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
          skipAuth: true,
        },
      );
    },
  },

  facilities: {
    list: async () => {
      const res = await request<any>("/api/v1/otp/slots/get_appointments/", {
        method: "GET",
      });

      const uniqueFacilities = Array.from(
        new Map(
          (res.results ?? []).map((item: any) => [
            item.facility.id,
            item.facility,
          ]),
        ).values(),
      );

      return {
        results: uniqueFacilities,
      };
    },

    get: async (id: string) => {
      return await request<Facility>(
        `/api/v1/otp/slots/get_appointments/${id}/`,
        {
          method: "GET",
        },
      );
    },
  },
  serviceCodes: {
    list: async (facilityId: string) => {
      if (!facilityId) return [];

      const res = await request<{
        facility_id: string;
        workflow: string;
        service_codes: string[];
      }>(
        `/api/care_digit_integration/internal/service-codes/?facility_id=${facilityId}&workflow=healthservice`,
        {
          method: "GET",
          // skipAuth: true,
        },
      );

      return res?.service_codes ?? [];
    },
  },
  filestore: {
    upload: async (files: File[], facilityId: string, workflow: string) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("file", file);
      });

      formData.append("facility_id", facilityId || "");
      formData.append("workflow", workflow);

      return await request<{
        files: { fileStoreId: string; tenantId: string }[];
      }>("/api/care_digit_integration/filestore/upload/", {
        method: "POST",
        body: formData,
        // skipAuth: true,
      });
    },
  },
};
