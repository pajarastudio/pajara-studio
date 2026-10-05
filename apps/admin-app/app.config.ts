import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Pajara Admin",
  slug: "pajara-admin",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  scheme: "pajara-admin",

  android: {
    package: "com.pajarastudio.admin",
  },
};

export default config;
