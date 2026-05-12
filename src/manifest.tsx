import { lazy } from "react";
import hi from "../public/locale/hi.json"

const manifest = {
  plugin: "care_issue_management",
  extends: [],
  components: {
    CareIssueManagementWidget: lazy(
      () => import("./providers"),
    ),
  },
  navItems: [],
  i18n: {
    hi,
  },
};

export default manifest;
