import pkg from "../package.json";
import { BIG_ICON, CONNECTED_ICON, OPTION_PAGE } from "./common/constants";

const manifest: chrome.runtime.ManifestBase = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  default_locale: "en",
  author: pkg.author,
  description: pkg.description,
  options_ui: {
    open_in_tab: false,
    page: OPTION_PAGE,
  },
  background: {
    service_worker: "src/background/index.js",
    type: "module",
  },
  action: {
    default_icon: {
      "16": CONNECTED_ICON,
    },
  },
  icons: {
    "128": BIG_ICON,
  },
  permissions: [
    "webRequest",
    "storage",
    "alarms",
    "activeTab",
    "tabs",
    "notifications",
  ],
  host_permissions: ["*://10fastfingers.com/"],
};

export default manifest;
