import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, QrCode } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { apis } from "@/apis";
import type { Encounter, PatientCredentials } from "@/types/kiosk";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  encounter_id: z.string().trim().nonempty("Encounter ID is required"),
  birth_year: z.string(),
  phone_number: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthStepProps {
  onSuccess: (credentials: PatientCredentials, encounters: Encounter[]) => void;
}

export default function AuthStep({ onSuccess }: AuthStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { encounter_id: "", birth_year: "", phone_number: "" },
  });

  const { mutate: authenticate, isPending } = useMutation({
    mutationFn: (credentials: PatientCredentials) => {
      return apis.encounters.list(
        credentials.encounter_id,
        credentials.birth_year,
        credentials.phone_number,
      );
    },
    onSuccess: (encounters, credentials) => {
      onSuccess(credentials, encounters);
    },
    onError: (err: any) => {
      const error =
        err?.error?.detail || "Something went wrong. Please try again.";
      toast.error(error);
    },
  });

  function onSubmit(values: FormValues) {
    const credentials: PatientCredentials = {
      encounter_id: values.encounter_id,
      birth_year: values.birth_year,
      phone_number: values.phone_number,
    };

    authenticate(credentials);
  }

  function handleQrPlaceholder() {
    toast.info(
      "QR scanner coming soon. Please enter the Encounter ID manually.",
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white shadow rounded-md p-8 flex flex-col gap-6">
        <div className="pb-4 border-b border-gray-200">
          <h4 className="font-semibold text-lg">Patient Verification</h4>
          <span className="text-sm text-gray-700">
            Enter your details or scan your QR code to continue
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Patient UUID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="patient-uuid">
              Encounter ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="patient-uuid"
                {...register("encounter_id")}
                placeholder="e.g. 23a72471e17f448c..."
                disabled={isPending}
                autoComplete="off"
                spellCheck={false}
                className="font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleQrPlaceholder}
                disabled={isPending}
                title="Scan QR Code"
                className="shrink-0"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            {errors.encounter_id && (
              <p className="text-xs text-red-500">
                {errors.encounter_id.message}
              </p>
            )}
          </div>

          {/* Birth Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="patient-birth-year">
              Birth Year
            </label>
            <Input
              id="patient-birth-year"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1985"
              {...register("birth_year")}
              disabled={isPending}
              autoComplete="off"
              min={1900}
              max={new Date().getFullYear()}
            />
            {errors.birth_year && (
              <p className="text-xs text-red-500">
                {errors.birth_year.message}
              </p>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <Separator className="w-full border" />
            <span className="absolute bg-white px-4 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Phone number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="patient-birth-year">
              Phone Number
            </label>
            <Input
              id="patient-phone-number"
              type="tel"
              inputMode="numeric"
              placeholder="e.g. 9876543210"
              {...register("phone_number")}
              disabled={isPending}
              autoComplete="off"
              max={new Date().getFullYear()}
            />
            {errors.phone_number && (
              <p className="text-xs text-red-500">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary_gradient"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
