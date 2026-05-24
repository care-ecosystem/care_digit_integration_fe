import { lazy } from "react";
import routes from "@/routes";
import en from "../public/locale/en.json";
import hi from "../public/locale/hi.json";

const manifest = {
  plugin: "care_digit_integration",
  routes,
  extends: [],
  components: {
    CareIssueManagementWidget: lazy(() => import("@/providers")),
    KioskComplaintPage: lazy(
      () => import("@/components/pages/KioskComplaintPage"),
    ),
  },
  navItems: [],
  i18n: {
    hi,
    en,
  },
};

export default manifest;
