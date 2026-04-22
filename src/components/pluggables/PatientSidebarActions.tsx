import { ActiveLink } from "raviger";

interface PatientSidebarActionsProps {
  patient: { id?: string };
}

const PatientSidebarActions = ({ patient }: PatientSidebarActionsProps) => {
  if (!patient?.id) return null;

  return (
    <ActiveLink
      href={`/patient/${patient.id}/complaints`}
      className="flex items-center gap-2 w-full h-8 px-2 rounded-md text-sm text-gray-600 font-normal transition hover:bg-gray-200 hover:text-green-700"
      activeClass="bg-white text-green-700 shadow-sm font-medium"
    >
      <span className="truncate">Complaint</span>
    </ActiveLink>
  );
};

export default PatientSidebarActions;