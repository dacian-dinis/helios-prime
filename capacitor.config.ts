import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.heliosprime.app",
  appName: "Helios Prime",
  // Points to the deployed web app — change to your Vercel URL in production
  server: {
    url: "http://localhost:3000",
    cleartext: true, // allow HTTP for local dev
  },
  plugins: {
    Keyboard: {
      resize: "body",
      style: "dark",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0a0a",
    },
  },
  ios: {
    scheme: "Helios Prime",
  },
  android: {
    backgroundColor: "#0a0a0a",
  },
};

export default config;
