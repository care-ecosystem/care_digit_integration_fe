// import { ActiveLink } from "raviger";
// import { AlertCircleIcon } from "lucide-react";

// interface PatientSidebarActionsProps {
//   patient: { id?: string };
// }

// const PatientSidebarActions = ({ patient }: PatientSidebarActionsProps) => {
//   if (!patient?.id) return null;

//   return (
//     <ActiveLink
//       href={`/patient/${patient.id}/complaints`}
//       className="flex items-center gap-2 w-full h-8 px-2 rounded-md text-sm text-gray-600 font-normal transition hover:bg-gray-200 hover:text-green-700"
//       activeClass="bg-white text-green-700 shadow-sm font-medium"
//     >
//       <AlertCircleIcon className="size-4 shrink-0" />
//       <span className="truncate">Complaint</span>
//     </ActiveLink>
//   );
// };

// export default PatientSidebarActions;

import { ActiveLink } from "raviger";
import { AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientSidebarActionsProps {
  patient: { id?: string };
}

const PatientSidebarActions = ({
  patient,
}: PatientSidebarActionsProps) => {
  if (!patient?.id) return null;

  return (
    <ActiveLink
      href={`/patient/${patient.id}/complaints`}
      className={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md",
        "p-2 h-8 text-sm",
        "text-left outline-hidden",
        "text-gray-600 font-normal transition",
        "hover:bg-gray-200 hover:text-green-700",

        // CARE sidebar behavior
        "focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",

        // collapsed sidebar behavior
        "group-data-[collapsible=icon]:size-8!",
        "group-data-[collapsible=icon]:p-2!",

        // icon/text sizing
        "[&>span:last-child]:truncate",
        "[&>svg]:size-4",
        "[&>svg]:shrink-0"
      )}
      activeClass="bg-sidebar-accent text-green-700 font-medium"
    >
      <AlertCircleIcon />

      <span className="group-data-[collapsible=icon]:hidden ml-1">
        Complaint
      </span>
    </ActiveLink>
  );
};

export default PatientSidebarActions;