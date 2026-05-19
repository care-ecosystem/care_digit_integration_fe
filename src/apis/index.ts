import { HttpMethod, PaginatedResponse } from "@/apis/types";
import { Complaint } from "@/types/complaint";
import { Facility } from "@/types/facility";
import { request } from "@/apis/query";
import { ServiceCodes } from "@/types/service_codes";

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
    list: (facility_id: string, workflow: string) =>
      request<ServiceCodes>(
        "/api/care_digit_integration/internal/service-codes/",
        HttpMethod.GET,
        { facility_id, workflow },
      ).then((res) => res?.service_codes ?? []),
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
