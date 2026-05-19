import ComplaintHomePage from "@/components/pages/ComplaintHomePage";
import ComplaintCreatePage from "@/components/pages/ComplaintCreatePage";
import ComplaintListPage from "@/components/pages/ComplaintListPage";

const routes = {
  "/patient/:id/complaints": ({ id }: { id: string }) => (
    <ComplaintHomePage patientId={id} />
  ),
  "/patient/:id/complaints/create": ({ id }: { id: string }) => (
    <ComplaintCreatePage patientId={id} />
  ),
  "/patient/:id/complaints/list": ({ id }: { id: string }) => (
    <ComplaintListPage patientId={id} />
  ),
};

export default routes;
