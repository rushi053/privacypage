import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrivacyPage",
    short_name: "PrivacyPage",
    description: "Privacy policy generator for apps. Free preview.",
    start_url: "/",
    display: "browser",
    background_color: "#F7F7F5",
    theme_color: "#0F5C63",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
