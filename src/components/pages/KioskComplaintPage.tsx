import "@/style/index.css";
import Page from "@/components/ui/page";
import { useCallback, useState } from "react";
import AuthStep from "@/components/kiosk/AuthStep";
import EncounterListStep from "@/components/kiosk/EncounterListStep";
import type { Encounter, PatientCredentials } from "@/types/kiosk";
import ComplaintCreateComponent from "@/components/kiosk/ComplaintCreateComponent";

type Step = 0 | 1 | 2;

export default function KioskComplaintPage() {
  const [step, setStep] = useState<Step>(0);
  const [credentials, setCredentials] = useState<PatientCredentials | null>(
    null,
  );
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  const handleAuthSuccess = useCallback(
    (creds: PatientCredentials, fetchedEncounters: Encounter[]) => {
      setCredentials(creds);
      setEncounters(fetchedEncounters);
      setStep(1);
    },
    [],
  );

  const handleAddFeedback = useCallback(() => {
    setStep(2);
  }, []);

  const resetToStart = useCallback(() => {
    setStep(0);
    setCredentials(null);
    setEncounters([]);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      resetToStart();
    }
  }, [step, resetToStart]);

  return (
    <Page
      title="Kiosk Complaint Page"
      className="p-0 care-communication-container"
      hideTitleOnPage
    >
      <div className="container mx-auto px-4 pb-12">
        {step === 0 && <AuthStep onSuccess={handleAuthSuccess} />}

        {step === 1 && (
          <EncounterListStep
            encounters={encounters}
            onAddFeedback={handleAddFeedback}
            onBack={handleBack}
          />
        )}

        {step === 2 && credentials && (
          <ComplaintCreateComponent
            credentials={credentials}
            patient_id={credentials.encounter_id}
            facility_id={encounters[0].facility.id}
            handleBack={handleBack}
            resetToStart={resetToStart}
            enable_upload={false}
          />
        )}
      </div>
    </Page>
  );
}
