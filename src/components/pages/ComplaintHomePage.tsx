import { FC } from "react";
import { PlusCircleIcon, ListIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { navigate } from "raviger";
import { I18NNAMESPACE } from "@/lib/constants";

interface ComplaintHomePageProps {
  /** Patient ID passed from care_fe route param */
  patientId?: string;
}

const ComplaintHomePage: FC<ComplaintHomePageProps> = ({ patientId }) => {
  const { t } = useTranslation(I18NNAMESPACE);

  const goToCreate = () => {
    const path = patientId
      ? `/patient/${patientId}/complaints/create`
      : "/complaints/create";
    navigate(path);
  };

  const goToList = () => {
    const path = patientId
      ? `/patient/${patientId}/complaints/list`
      : "/complaints/list";
    navigate(path);
  };

  return (
    <div className="care-issue-management-fe-container">
      <div className="mx-auto max-w-2xl w-full px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">
            {t("complaints")}
          </h2>
          <p className="text-xs text-secondary-500 mt-0.5">
            {t("complaints_subtitle")}
          </p>
        </div>

        <div className="border-t border-secondary-200" />

        {/* Menu cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={goToCreate}
            className="group flex items-start gap-4 rounded-xl border border-secondary-200 bg-white p-5 text-left shadow-xs transition-all hover:border-primary-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
              <PlusCircleIcon className="size-5" />
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-medium text-secondary-900">
                {t("new_complaint")}
              </span>
              <span className="block text-xs text-secondary-500">
                {t("new_complaint_hint")}
              </span>
            </span>
          </button>

          <button
            onClick={goToList}
            className="group flex items-start gap-4 rounded-xl border border-secondary-200 bg-white p-5 text-left shadow-xs transition-all hover:border-primary-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200 transition-colors">
              <ListIcon className="size-5" />
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-medium text-secondary-900">
                {t("all_complaints")}
              </span>
              <span className="block text-xs text-secondary-500">
                {t("all_complaints_hint")}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintHomePage;
