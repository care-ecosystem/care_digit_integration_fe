export type PgrStatus =
  | "PENDING_SYNC"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "SYNC_FAILED";

export type ServiceCode =
  | "TechnicalIssues"
  | "PerformanceIssue"
  | "Other"
  | "Data"
  | "SecurityIssues";

export type Workflow = "SYSTEM" | "HEALTHSERVICE";

export type Complaint = {
  id: string;
  external_id: string;
  service_code: ServiceCode;
  workflow: Workflow;
  pgr_status: PgrStatus;
  pgr_ticket_id: string | null;
  created_date: string;
  modified_date: string;
  // Optional fields sent during creation and returned by the API
  title?: string;
  description?: string;
  patient?: string;
  facility?: string;
  [key: string]: unknown;
};

export type CreateComplaintPayload = {
  service_code: ServiceCode;
  workflow: Workflow;
  patient: string;
  facility: string;
  title?: string;
  description?: string;
};

export type ServiceCodeOption = {
  code: ServiceCode;
  name: string;
};
