import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { I18NNAMESPACE } from "@/lib/constants";

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

function usePluginFacilityId() {
  if (typeof window === "undefined") return undefined;
  const segments = window.location.pathname.split("/");
  const idx = segments.indexOf("facility");
  if (idx !== -1 && segments[idx + 1]) {
    return segments[idx + 1];
  }
  return undefined;
}

export default function FormPopup({

  onClose,
  onSubmitSuccess,
  files,
  setFiles,
  capturedScreenshots,
  setCapturedScreenshots,
}: FormPopupProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ ADDED
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const facilityId = usePluginFacilityId();
  const filesRef = useRef<File[]>(files);
  const { t } = useTranslation(I18NNAMESPACE);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ISSUE_LABELS: Record<string, string> = {
  TechnicalIssues: t("Technical Issues"),
  Other: t("other"),
  PerformanceIssue: t("Performance Issue"),
  Data: t("Data Issue"),
  SecurityIssues: t("Security Issues"),
};
  
  const { data: issueOptions = [] } = useQuery({
    queryKey: ["service-codes", facilityId],
    queryFn: async () => {
      const token = localStorage.getItem("care_access_token");
      const res = await fetch(
        `http://localhost:9000/api/care_digit_integration/internal/service-codes/?facility_id=${facilityId}&workflow=system`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error("API error");
      return (data.service_codes || []) as string[];
    },
    enabled: !!facilityId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter((file) => ALLOWED_TYPES.has(file.type));
      setFileError(validFiles.length < selected.length);
      setFiles((prev) => {
        const updated = [...prev, ...validFiles];
        filesRef.current = updated;
        return updated;
      });
    }
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

  const uploadToFileStore = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", "mz");
    formData.append("module", "care-pgr");

    const token = localStorage.getItem("care_access_token");
    const res = await fetch(
      "http://localhost:9000/api/care_digit_integration/filestore/upload/",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Filestore upload failed");

    return {
      fileStoreId: data?.fileStoreId || data?.files?.[0]?.fileStoreId,
      tenantId: data?.tenantId || "mz",
    };
  };

  const dataURLtoFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("care_access_token");
      if (!token) return null;
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const getSource = () => {
    if (typeof navigator === "undefined") return "web";
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("chrome-extension")) return "extension";
    if (ua.includes("mobile")) return "mobile-web";
    return "web";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUserFromToken();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const screenshotFiles = capturedScreenshots.map((src, idx) =>
        dataURLtoFile(src, `screenshot-${idx}.png`)
      );

      const allFiles = [...filesRef.current, ...screenshotFiles];

      const uploadedFiles = await Promise.all(
        allFiles.map((file) => uploadToFileStore(file))
      );

      const token = localStorage.getItem("care_access_token");

      const filestore_uploads = uploadedFiles
        .filter((f) => f?.fileStoreId)
        .map((f) => ({ fileStoreId: f.fileStoreId, tenantId: f.tenantId }));

      const complaintPayload = {
        facility: facilityId,
        reporter: user?.user_id || null,
        workflow: "system",
        service_code: title,
        app_context: {
          Platform: navigator.platform,
          Browser: navigator.userAgent,
        },
        description,
        filestore_uploads,
        source: getSource(),
      };

      const res = await fetch(
        "http://localhost:9000/api/care_digit_integration/pgr/complaints/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(complaintPayload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("PGR API error:", data);
        //toast.error("Failed to submit issue. Please try again."); 
        toast.error(t("submit_error"));
        setHasError(true);
        return;
      }

      console.log("Complaint Created Successfully:", data);

      // ✅ only clear on success, via parent
      setTitle("");
      setDescription("");
      setFileError(false);
      toast.success(t("submit_success"));
      onSubmitSuccess(); // clears files + screenshots in parent and closes
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(t("upload_error"));// ✅ added
      setHasError(true);
    } finally {
    setIsSubmitting(false); // 🔓 3. Unlock ALWAYS
  }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[520px] max-w-full relative shadow-2xl flex flex-col gap-6">
        <Button
          variant="ghost"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          onClick={onClose}
        >
          ✕
        </Button>

        <h2 className="text-2xl font-semibold text-center">{t("Submit Issue")}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">{t("title")}</Label>
            <Select value={title} onValueChange={setTitle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("title_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {issueOptions.map((issue, idx) => (
                  <SelectItem key={idx} value={issue}>
                    {ISSUE_LABELS[issue] || issue}
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
            {/* <Input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileChange}
            /> */}
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
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              {t("Choose Files")}
            </Button>
            
            {fileError && (
              <p className="text-xs text-red-500">
                {t("File Error")}
              </p>
            )}

            {previewItems.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="relative border rounded-md overflow-hidden w-24 h-24"
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

          <Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <span className="flex items-center gap-2">
      {/* 🔄 Spinner */}
      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      
      {/* 📝 Text */}
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