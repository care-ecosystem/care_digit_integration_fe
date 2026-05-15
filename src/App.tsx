import { Toaster } from "@/components/ui/sonner";
import {
  BugIcon,
  CameraIcon,
  NotebookPenIcon,
  NotebookTextIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { useScreenCapture } from "./hooks/useScreenCapture";
import FormPopup from "./FormPopup";
import IssueListPopup from "./IssueListPopup";
import ComplaintHomePage from "@/components/pages/ComplaintHomePage";

function IssueManagementWidget({
  onCaptureCB,
  onOpenForm,
  onOpenIssueList,
}: {
  onCaptureCB: () => void;
  onOpenForm: () => void;
  onOpenIssueList: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild className="fixed bottom-20 right-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-16 w-16 shadow-xl bg-primary-600"
        >
          <BugIcon className="text-white" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="flex flex-col-reverse gap-2 min-w-0 w-fit shadow-none ring-0 px-0"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-16 w-16 shadow-xl bg-primary-400"
          onClick={onCaptureCB}
        >
          <CameraIcon className="text-white" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-16 w-16 shadow-xl bg-primary-400"
          onClick={onOpenForm}
        >
          <NotebookPenIcon className="text-white" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-16 w-16 shadow-xl bg-primary-400"
          onClick={onOpenIssueList}
        >
          <NotebookTextIcon className="text-white" />
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function App() {
  const { capture } = useScreenCapture();
  const [isIssueListOpen, setIsIssueListOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [capturedScreenshots, setCapturedScreenshots] = useState<string[]>([]);

  const handleCaptureScreenShot = async () => {
    try {
      const image = await capture();
      setCapturedScreenshots((prev) => [...prev, image]);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const handleFormClose = () => setIsFormOpen(false);

  const handleFormSubmitSuccess = () => {
    setFiles([]);
    setCapturedScreenshots([]);
    setIsFormOpen(false);
  };

  return (
    <div className="care-issue-management-fe-container">
      <Toaster position="top-right" richColors expand theme="light" />

      {/* Branch 2: ComplaintHomePage */}
      <ComplaintHomePage />

      {/* Branch 1: Issue Management Widget */}
      <IssueManagementWidget
        onCaptureCB={handleCaptureScreenShot}
        onOpenForm={() => setIsFormOpen(true)}
        onOpenIssueList={() => setIsIssueListOpen(true)}
      />

      {isFormOpen && (
        <FormPopup
          onClose={handleFormClose}
          onSubmitSuccess={handleFormSubmitSuccess}
          files={files}
          setFiles={setFiles}
          capturedScreenshots={capturedScreenshots}
          setCapturedScreenshots={setCapturedScreenshots}
        />
      )}
      {isIssueListOpen && (
        <IssueListPopup onClose={() => setIsIssueListOpen(false)} />
      )}
    </div>
  );
}