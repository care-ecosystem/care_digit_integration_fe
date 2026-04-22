import { FC, useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { PlusCircleIcon, Loader2Icon, ChevronLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { navigate, useQueryParams } from "raviger";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FacilityDropdown } from "@/components/common/FacilityDropdown";
import {
  FileUploadZone,
  FilePreview,
} from "@/components/common/FileUploadZone";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
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

const ComplaintCreatePage: FC<ComplaintCreatePageProps> = ({ patientId }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useQueryParams<{
    facilityId?: string;
  }>();

  const [serviceCode, setServiceCode] = useState("");
  const [description, setDescription] = useState("");
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facilityId = queryParams.facilityId ?? "";

  const { data: serviceCodes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ["service-codes", facilityId],
    queryFn: () => apis.serviceCodes.list(facilityId),
    enabled: !!facilityId,
  });

  useEffect(() => {
    setServiceCode("");
  }, [facilityId]);

  const handleFacilityChange = (id: string) => {
    setQueryParams({ ...queryParams, facilityId: id });
  };

  const goBack = () => {
    navigate(patientId ? `/patient/${patientId}/complaints` : "/complaints");
  };

  const goToList = () => {
    navigate(
      patientId
        ? `/patient/${patientId}/complaints/list`
        : "/complaints/list",
    );
  };

  const { mutateAsync: submit } = useMutation({
    mutationFn: apis.complaints.create,
  });

  const getSource = () => {
    const ua = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|mobile/.test(ua) ? "mobile" : "web";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!serviceCode || !facilityId || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let filestoreUploads: {
        fileStoreId: string;
        tenantId: string;
      }[] = [];

      if (filePreviews.length > 0) {
        const files = filePreviews.map((f) => f.file);
        const res = await apis.filestore.upload(files);

        if (!res?.files?.length) {
          throw new Error("File upload failed");
        }

        // ✅ Direct mapping (no transformation needed)
        filestoreUploads = res.files.map((f: any) => ({
          fileStoreId: f.fileStoreId,
          tenantId: f.tenantId,
        }));
      }

      const payload = {
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

        // ✅ IMPORTANT: send full objects, not just IDs
        filestore_uploads: filestoreUploads,
      };

      console.log("FINAL PAYLOAD", payload);

      await submit(payload);

      toast.success(t("complaint_submitted"));
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      goToList();

    } catch (err: any) {
      console.error(err);

      // ✅ Better DRF error handling
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        err?.message ||
        "Something went wrong";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="care-issue-management-fe-container">
      <div className="mx-auto max-w-2xl w-full px-4 py-6 space-y-5">

        {/* Header */}
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

        {/* Form Card */}
        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset disabled={isSubmitting}>

                <FacilityDropdown
                  value={facilityId}
                  onChange={handleFacilityChange}
                />

                {/* Service Code - UPDATED WITH RADIX SELECT */}
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
                          loadingCodes
                            ? "Loading..."
                            : "Select Service Type"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {serviceCodes.map((code: string) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
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

                {/* Attachments */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("attachments")}
                  </label>

                  <FileUploadZone
                    files={filePreviews}
                    onChange={setFilePreviews}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !serviceCode ||
                      !facilityId ||
                      !description.trim()
                    }
                    className="gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <PlusCircleIcon className="size-4" />
                    )}

                    {isSubmitting
                      ? "Submitting..."
                      : t("submit_complaint")}
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