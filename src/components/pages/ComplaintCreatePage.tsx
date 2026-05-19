import { FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircleIcon, Loader2Icon, ChevronLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { navigate } from "raviger";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useFacilities } from "@/hooks/useFacilities";
import {
  FileUploadZone,
  FilePreview,
} from "@/components/common/FileUploadZone";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis_new, apis } from "@/apis";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ComplaintCreatePageProps {
  patientId?: string;
}

interface CreateComplaintPayload {
  facilityId: string;
  serviceCode: string;
  description: string;
  files: FilePreview[];
  patientId?: string;
}

const getSource = () => {
  const ua = navigator.userAgent.toLowerCase();

  return /android|iphone|ipad|mobile/.test(ua) ? "mobile" : "web";
};

const createComplaint = async ({
  facilityId,
  serviceCode,
  description,
  files,
  patientId,
}: CreateComplaintPayload) => {
  let filestoreUploads: {
    fileStoreId: string;
    tenantId: string;
  }[] = [];

  if (files.length > 0) {
    const formData = new FormData();

    files.forEach((preview) => {
      formData.append("file", preview.file);
    });

    formData.append("facility_id", facilityId);
    formData.append("workflow", "healthservice");

    const uploadRes = await apis_new.filestore.upload(formData);

    if (!uploadRes?.files?.length) {
      throw new Error("File upload failed");
    }

    filestoreUploads = uploadRes.files.map((file) => ({
      fileStoreId: file.fileStoreId,
      tenantId: file.tenantId,
    }));
  }

  return apis_new.complaints.create({
    facility: facilityId,
    reporter: patientId,
    workflow: "healthservice",
    service_code: serviceCode,
    description: description.trim(),
    source: getSource(),
    app_context: {
      Platform: navigator.platform,
      Browser: navigator.userAgent,
    },
    filestore_uploads: filestoreUploads,
  });
};

const ComplaintCreatePage: FC<ComplaintCreatePageProps> = ({ patientId }) => {
  const { t } = useTranslation(I18NNAMESPACE);

  const queryClient = useQueryClient();

  const [facilityId, setFacilityId] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [description, setDescription] = useState("");
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  const { facilities } = useFacilities();

  const { data: serviceCodes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ["service-codes", facilityId],
    queryFn: () => apis_new.serviceCodes.list(facilityId, "healthservice"),
    enabled: !!facilityId,
  });

  const complaintMutation = useMutation({
    mutationKey: ["create-complaint"],

    mutationFn: createComplaint,

    onSuccess: async () => {
      toast.success(t("complaint_submitted"));

      await queryClient.invalidateQueries({
        queryKey: ["complaints"],
      });

      navigate(
        patientId
          ? `/patient/${patientId}/complaints/list`
          : "/complaints/list",
      );
    },

    onError: (err: any) => {
      console.error(err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      toast.error(errorMessage);
    },
  });

  const handleFacilityChange = (value: string) => {
    setFacilityId(value);

    setServiceCode("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityId || !serviceCode || !description.trim()) {
      toast.error("Please fill all required fields");

      return;
    }

    complaintMutation.mutate({
      facilityId,
      serviceCode,
      description,
      files: filePreviews,
      patientId,
    });
  };

  const goBack = () => {
    navigate(patientId ? `/patient/${patientId}/complaints` : "/complaints");
  };

  const isSubmitting = complaintMutation.isPending;

  const isSubmitDisabled =
    isSubmitting || !facilityId || !serviceCode || !description.trim();

  return (
    <div className="care-issue-management-fe-container">
      <div className="mx-auto max-w-2xl w-full px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ChevronLeftIcon className="size-4" />
          </Button>

          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              {t("new_complaint")}
            </h2>

            <p className="text-xs text-secondary-500 mt-0.5">
              {t("create_subtitle")}
            </p>
          </div>
        </div>

        <div className="border-t border-secondary-200" />

        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isSubmitting} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("facility")}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>

                  <Select
                    value={facilityId}
                    onValueChange={handleFacilityChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Facility" />
                    </SelectTrigger>

                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("complaint_title")}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>

                  <Select
                    value={serviceCode}
                    onValueChange={setServiceCode}
                    disabled={!facilityId || loadingCodes}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingCodes ? "Loading..." : "Select Service Type"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {serviceCodes.map((code: string) => (
                        <SelectItem key={code} value={code}>
                          {t(code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("complaint_description")}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("complaint_description_placeholder")}
                    rows={4}
                    className="w-full rounded-lg border border-secondary-400 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("attachments")}
                  </label>

                  <FileUploadZone
                    files={filePreviews}
                    onChange={setFilePreviews}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <PlusCircleIcon className="size-4" />
                    )}

                    {isSubmitting ? "Submitting..." : t("submit_complaint")}
                  </Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintCreatePage;
