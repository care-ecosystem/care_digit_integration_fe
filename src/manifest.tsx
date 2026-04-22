import { lazy } from "react";
import routes from "./routes";
import en from "../public/locale/en.json";

const manifest = {
  plugin: "care_issue_management",

  routes,

  components: {
    PatientSidebarActions: lazy(
      () => import("./components/pluggables/PatientSidebarActions.tsx"),
    ),
  },

  extends: [],
  navItems: [],
  i18n: {
    en,
  },
};

export default manifest;
