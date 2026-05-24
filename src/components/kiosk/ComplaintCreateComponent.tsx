import { I18NNAMESPACE } from "@/lib/constants";
import { PatientCredentials } from "@/types/kiosk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apis } from "@/apis";
import { Button } from "../ui/button";
import { ChevronLeftIcon, Loader2Icon, PlusCircleIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Select } from "../ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

interface ComplaintCreateComponentProps {
  credentials: PatientCredentials;
  patient_id: string;
  facility_id: string;
  enable_upload?: boolean;
  handleBack: () => void;
  resetToStart: () => void;
}

const ComplaintCreateComponent: FC<ComplaintCreateComponentProps> = ({
  credentials,
  patient_id,
  facility_id,
  handleBack,
  resetToStart,
}) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();

  const [serviceCode, setServiceCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: serviceCodes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ["service-codes", facility_id],
    queryFn: () =>
      apis.serviceCodes.list(
        facility_id,
        "healthservice",
        credentials.encounter_id,
        credentials.birth_year,
        credentials.phone_number,
      ),
    enabled: !!facility_id && !!credentials.encounter_id,
  });

  useEffect(() => {
    setServiceCode("");
  }, [facility_id]);

  const { mutateAsync: submit } = useMutation({
    mutationFn: apis.complaints.create,
    onSuccess: (res) => {
      toast.success(
        "You can track the complaint status using ticket ID: " +
          res?.pgr_ticket_id,
      );
    },
  });

  const getSource = () => {
    const ua = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|mobile/.test(ua) ? "mobile" : "web";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!serviceCode || !facility_id || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        facility: facility_id,
        reporter: patient_id,
        workflow: "healthservice",
        service_code: serviceCode,
        description: description.trim(),
        source: getSource(),
        app_context: {
          Platform: navigator.platform,
          Browser: navigator.userAgent,
        },
        ...credentials,
        auth_type: "encounter_based",
      };

      await submit(payload);

      toast.success(t("complaint_submitted"));
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      resetToStart();
    } catch (err: any) {
      console.error(err);
      
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
          <Button variant="ghost" size="icon" onClick={handleBack}>
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
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isSubmitting} className="space-y-4">
                {/* Service Code - UPDATED WITH RADIX SELECT */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary-700">
                    {t("complaint_title")}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>

                  <Select
                    value={serviceCode}
                    onValueChange={setServiceCode}
                    disabled={!facility_id || loadingCodes}
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

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !serviceCode ||
                      !facility_id ||
                      !description.trim()
                    }
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

export default ComplaintCreateComponent;
