import React, { useState, useRef } from "react"; // ✅ FIX ADDED
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface FormPopupProps {
  onClose: () => void;
  screenShots?: string[];
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

export default function FormPopup({ onClose, screenShots = [] }: FormPopupProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [capturedScreenshots, setCapturedScreenshots] =
    useState<string[]>(screenShots);
  const [fileError, setFileError] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const facilityId = usePluginFacilityId();

  // ✅ FIX: stable file storage
  const filesRef = useRef<File[]>([]);

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
      const validFiles = selected.filter((file) =>
        ALLOWED_TYPES.has(file.type)
      );

      setFileError(validFiles.length < selected.length);

      setFiles((prev) => {
        const updated = [...prev, ...validFiles];
        filesRef.current = updated; // ✅ FIX
        return updated;
      });
    }
  };

  // const removeFile = (idx: number) => {
  //   setFiles(files.filter((_, i) => i !== idx));
  // };

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    filesRef.current = updated; // ✅ keep in sync
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Filestore upload failed");
    }

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

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("care_access_token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
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
    try {
      // ✅ FIX: use ref instead of state
      // ✅ convert screenshots to File
      const screenshotFiles = capturedScreenshots.map((src, idx) =>
        dataURLtoFile(src, `screenshot-${idx}.png`)
      );

      // ✅ merge both
      const allFiles = [...filesRef.current, ...screenshotFiles];

      // ✅ upload everything
      const uploadedFiles = await Promise.all(
        allFiles.map((file) => uploadToFileStore(file))
      );

      setUploadedFiles(uploadedFiles);

      const token = localStorage.getItem("care_access_token");

      const filestore_uploads = uploadedFiles
        .filter((f) => f?.fileStoreId)
        .map((f) => ({
          fileStoreId: f.fileStoreId,
          tenantId: f.tenantId,
        }));
      console.log("User from storage:", user);
      const complaintPayload = {
        facility: facilityId,
        reporter: user?.user_id || null,
        workflow: "system",
        service_code: title,
        app_context: {
          Platform: navigator.platform,
          Browser: navigator.userAgent,
        },
        description: description,
        filestore_uploads,
        source: getSource(),
      };

      console.log("Complaint Payload:", complaintPayload);

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
        return;
      }

      console.log("Complaint Created Successfully:", data);
    } catch (err) {
      console.error("Upload error:", err);
    }

    setTitle("");
    setDescription("");
    setFiles([]);
    filesRef.current = []; // ✅ FIX
    setCapturedScreenshots([]);
    setFileError(false);
    onClose();
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

        <h2 className="text-2xl font-semibold text-center">Submit Issue</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Title</Label>
            <Select value={title} onValueChange={setTitle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueOptions.map((issue, idx) => (
                  <SelectItem key={idx} value={issue}>
                    {issue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Attach Files</Label>
            <Input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileChange}
            />
            {fileError && (
              <p className="text-xs text-red-500">
                Only image files (PNG, JPG, WebP, GIF) allowed.
              </p>
            )}

            {/* ✅ PREVIEW SECTION ADDED */}
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

                    {/* Screenshot label */}
                    {item.kind === "screenshot" && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                        Screenshot
                      </span>
                    )}

                    {/* Remove button */}
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

          <Button type="submit">Submit Issue</Button>
        </form>
      </div>
    </div>
  );
}

