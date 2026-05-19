import { request, queryString } from "./request";
import { HttpMethod, PaginatedResponse } from "./types";
import { Complaint } from "@/types/complaint";
import { Facility } from "@/types/facility";
import { request as request_new } from "./query";
import { ServiceCodes } from "@/types/service_codes";

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
    upload: async (formData: FormData) => {
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

export const apis_new = {
  complaints: {
    list: (offset?: number, limit?: number, patient_id?: string) =>
      request_new<PaginatedResponse<Complaint>>(
        "/api/care_digit_integration/pgr/complaints/",
        HttpMethod.GET,
        { offset, limit, patient_id },
      ),

    create: (data: any) =>
      request_new<Complaint>(
        "/api/care_digit_integration/pgr/complaints/",
        HttpMethod.POST,
        data,
      ),
  },

  serviceCodes: {
    list: (facility_id: string, workflow: string) =>
      request_new<ServiceCodes>(
        "/api/care_digit_integration/internal/service-codes/",
        HttpMethod.GET,
        { facility_id, workflow },
      ).then((res) => res?.service_codes ?? []),
  },

  filestore: {
    upload: (formData: FormData) =>
      request_new<{
        files: {
          fileStoreId: string;
          tenantId: string;
        }[];
      }>(
        "/api/care_digit_integration/filestore/upload/",
        HttpMethod.POST,
        formData,
        {
          formdata: true,
        },
      ),
  },
  facilities: {
    list: () =>
      request_new<{
        results: { facility: Facility }[];
      }>("/api/v1/otp/slots/get_appointments/", HttpMethod.GET).then((res) => {
        const uniqueFacilities = Array.from(
          new Map(
            (res.results ?? []).map((item: { facility: Facility }) => [
              item.facility.id,
              item.facility,
            ]),
          ).values(),
        );

        return {
          results: uniqueFacilities,
        };
      }),
  },
};
