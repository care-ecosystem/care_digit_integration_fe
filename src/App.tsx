/**
 * App.tsx is only used for local development preview (vite dev server).
 * The actual plugin entry point is src/index.tsx which exports `manifest`.
 */
import { Toaster } from "@/components/ui/sonner";
import ComplaintHomePage from "@/components/pages/ComplaintHomePage";

export default function App() {
  return (
    <div className="care-issue-management-fe-container">
      <Toaster position="top-right" richColors expand theme="light" />
      {/* Dev preview — renders home page without a patientId */}
      <ComplaintHomePage />
    </div>
  );
}
