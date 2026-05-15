import { lazy } from "react";
import routes from "./routes";
import en from "../public/locale/en.json";
import hi from "../public/locale/hi.json"

const manifest = {
  plugin: "care_issue_management",
  routes,
  extends: [],
  components: {
    CareIssueManagementWidget: lazy(
      () => import("./providers"),
    ),
    PatientSidebarActions: lazy(
      () => import("./components/pluggables/PatientSidebarActions.tsx"),
    ),
  },
  navItems: [],
  i18n: {
    hi,
    en
  },
};

export default manifest;
