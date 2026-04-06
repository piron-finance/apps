import { deskTool } from "sanity/desk";
import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/schemaTypes";
import { structure } from "./src/structure";

export default defineConfig({
  name: "default",
  title: "Piron CMS",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "your-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [deskTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== "blogSettings"),
  },
});
