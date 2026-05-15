import { lazy } from "react";

const ComplaintHomePage = lazy(
  () => import("./components/pages/ComplaintHomePage"),
);
const ComplaintCreatePage = lazy(
  () => import("./components/pages/ComplaintCreatePage"),
);
const ComplaintListPage = lazy(
  () => import("./components/pages/ComplaintListPage"),
);

const routes = {
  // Home / menu
  "/patient/:id/complaints": ({ id }: { id: string }) => (
    <ComplaintHomePage patientId={id} />
  ),

  // Create complaint — facilityId is persisted as a URL query param
  // e.g. /patient/123/complaints/create?facilityId=abc
  "/patient/:id/complaints/create": ({ id }: { id: string }) => (
    <ComplaintCreatePage patientId={id} />
  ),

  // List all complaints for the patient
  "/patient/:id/complaints/list": ({ id }: { id: string }) => (
    <ComplaintListPage patientId={id} />
  ),
  "/facility/testing": <div>Testing route</div>,
};

export default routes;
