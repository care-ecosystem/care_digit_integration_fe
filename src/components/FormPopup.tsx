import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
import type { ServiceCode, Workflow } from "@/types/complaint";

interface FormPopupProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  capturedScreenshots: string[];
  setCapturedScreenshots: React.Dispatch<React.SetStateAction<string[]>>;
}

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const WORKFLOW: Workflow = "system";

const ISSUE_LABELS: Record<string, string> = {
  TechnicalIssues: "Technical Issues",
  Other: "Other",
  PerformanceIssue: "Performance Issue",
  Data: "Data Issue",
  SecurityIssues: "Security Issues",
};

function usePluginFacilityId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const segments = window.location.pathname.split("/");
  const idx = segments.indexOf("facility");
  if (idx !== -1 && segments[idx + 1]) {
    return segments[idx + 1];
  }
  return undefined;
}

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

function getSource(): string {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("chrome-extension")) return "extension";
  if (ua.includes("mobile")) return "mobile-web";
  return "web";
}

export default function FormPopup({
  onClose,
  onSubmitSuccess,
  files,
  setFiles,
  capturedScreenshots,
  setCapturedScreenshots,
}: FormPopupProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facilityId = usePluginFacilityId();
  const filesRef = useRef<File[]>(files);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: issueOptions = [] } = useQuery({
    queryKey: ["service-codes", facilityId],
    queryFn: () => apis.serviceCodes.list(facilityId!, "system"),
    enabled: !!facilityId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter((file) => ALLOWED_TYPES.has(file.type));
    setFileError(validFiles.length < selected.length);
    setFiles((prev) => {
      const updated = [...prev, ...validFiles];
      filesRef.current = updated;
      return updated;
    });
  };

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    filesRef.current = updated;
  };

  const removeScreenshot = (idx: number) => {
    setCapturedScreenshots((prev) => prev.filter((_, i) => i !== idx));
  };

  const previewItems = [
    ...files.map((file, idx) => ({
      kind: "file" as const,
      idx,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/"),
      label: file.name,
    })),
    ...capturedScreenshots.map((src, idx) => ({
      kind: "screenshot" as const,
      idx,
      url: src,
      isImage: true,
      label: `Screenshot ${idx + 1}`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const screenshotFiles = capturedScreenshots.map((src, idx) =>
        dataURLtoFile(src, `screenshot-${idx}.png`),
      );
      const allFiles = [...filesRef.current, ...screenshotFiles];

      const uploadedFiles = await Promise.all(
        allFiles.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("tenantId", "mz");
          formData.append("module", "care-pgr");
          return apis.filestore.upload(formData);
        }),
      );

      const filestore_uploads = uploadedFiles
        .flatMap((res) => res?.files ?? [])
        .filter((f) => f?.fileStoreId)
        .map((f) => ({ fileStoreId: f.fileStoreId, tenantId: f.tenantId }));

      await apis.complaints.create({
        facility: facilityId,
        workflow: WORKFLOW,
        service_code: serviceCode,
        description,
        filestore_uploads,
        source: getSource(),
        app_context: {
          Platform: navigator.platform,
          Browser: navigator.userAgent,
        },
      });

      setServiceCode("");
      setDescription("");
      setFileError(false);
      toast.success(t("submit_success"));
      onSubmitSuccess();
    } catch (err) {
      console.error("Complaint submission error:", err);
      toast.error(t("upload_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col gap-4 sm:gap-5 md:gap-6">
        <Button
          variant="ghost"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          onClick={onClose}
        >
          ✕
        </Button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">{t("title")}</Label>
            <Select
              value={serviceCode}
              onValueChange={(v) => setServiceCode(v as ServiceCode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("title_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {issueOptions.map((issue) => (
                  <SelectItem key={issue} value={issue}>
                    {t(ISSUE_LABELS[issue] ?? issue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">{t("description")}</Label>
            <Textarea
              placeholder={t("description_placeholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">{t("Attach Files")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              {t("Choose Files")}
            </Button>

            {fileError && (
              <p className="text-xs text-red-500">{t("File Error")}</p>
            )}

            {previewItems.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-2">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="relative border rounded-md overflow-hidden w-full aspect-square"
                  >
                    {item.isImage ? (
                      <img
                        src={item.url}
                        alt={item.label}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xs text-gray-700 text-center p-1">
                        {item.label}
                      </div>
                    )}

                    {item.kind === "screenshot" && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                        {t("Screenshot")}
                      </span>
                    )}

                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() =>
                        item.kind === "file"
                          ? removeFile(item.idx)
                          : removeScreenshot(item.idx)
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Submitting...")}
              </span>
            ) : (
              t("Submit Button")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
