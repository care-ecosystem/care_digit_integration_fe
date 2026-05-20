import { HttpMethod, PaginatedResponse } from "@/apis/types";
import { Complaint } from "@/types/complaint";
import { Facility } from "@/types/facility";
import { request } from "@/apis/query";
import { ServiceCodes } from "@/types/service_codes";
import { Encounter } from "@/types/kiosk";

export const apis = {
  complaints: {
    list: (offset?: number, limit?: number, patient_id?: string) =>
      request<PaginatedResponse<Complaint>>(
        "/api/care_digit_integration/pgr/complaints/",
        HttpMethod.GET,
        { offset, limit, patient_id },
      ),

    create: (data: any) =>
      request<Complaint>(
        "/api/care_digit_integration/pgr/complaints/",
        HttpMethod.POST,
        data,
      ),
  },

  serviceCodes: {
    list: (
      facility_id: string,
      workflow: string,
      encounter_id?: string,
      birth_year?: string,
      phone_number?: string,
      auth_type?: "encounter_based",
    ) =>
      request<ServiceCodes>(
        "/api/care_digit_integration/internal/service-codes/",
        HttpMethod.GET,
        {
          facility_id,
          workflow,
          encounter_id,
          birth_year,
          phone_number,
          auth_type,
        },
      ).then((res) => res?.service_codes ?? []),
  },

  encounters: {
    list: async (
      encounter_id: string,
      birth_year?: string,
      phone_number?: string,
    ) => {
      return await request<Encounter[]>(
        "/api/care_communication/kiosk/encounters/",
        HttpMethod.GET,
        {
          encounter_id,
          birth_year,
          phone_number,
        },
      );
    },
  },
  filestore: {
    upload: (formData: FormData) =>
      request<{
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
      request<{
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
