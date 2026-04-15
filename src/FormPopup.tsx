import React, { useState } from "react";
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
  const [capturedScreenshots, setCapturedScreenshots] = useState<string[]>(screenShots);
  const [fileError, setFileError] = useState(false);

  const facilityId = usePluginFacilityId();

  // ✅ TanStack Query replaces useEffect + useState for service codes
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
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
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
    const payload = { title, description };
    try {
      const response = await fetch("http://localhost:9000/api/issue_flow/issues/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("care_access_token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Issue saved:", data);
      } else {
        console.error("Backend error:", data);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
    setTitle("");
    setDescription("");
    setFiles([]);
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
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-xs text-red-500 mt-1">
                Only image files (PNG, JPG, WebP, GIF) are allowed. Other files were ignored.
              </p>
            )}
            {previewItems.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {previewItems.map((item, i) => (
                  <div key={i} className="relative border rounded-md overflow-hidden w-24 h-24">
                    <img src={item.url} alt={item.label} className="object-cover w-full h-full" />
                    <Button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() =>
                        item.kind === "file" ? removeFile(item.idx) : removeScreenshot(item.idx)
                      }
                    >
                      ✕
                    </Button>
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