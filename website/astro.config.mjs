// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi";

// https://astro.build/config
export default defineConfig({
  site: "https://hhs.github.io",
  // Base needs trailing slash to make relative links work when hosting locally
  base: "simpler-grants-protocol/",
  integrations: [
    starlight({
      plugins: [
        starlightLinksValidator({
          errorOnLocalLinks: false,
        }),
        // Generate the OpenAPI documentation pages.
        starlightOpenAPI([
          {
            base: "reference/api",
            label: "CommonGrants API spec",
            schema: "./tsp-output/@typespec/openapi3/openapi.yaml",
          },
        ]),
      ],
      title: "CommonGrants",
      social: {
        github: "https://github.com/HHS/simpler-grants-protocol",
      },
      editLink: {
        baseUrl:
          "https://github.com/HHS/simpler-grants-protocol/edit/main/website/",
      },
      sidebar: [
        {
          label: "Welcome",
          items: [
            { label: "Getting started", link: "getting-started" },
            { label: "About CommonGrants", link: "about" },
          ],
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Reference",
          items: [
            { label: "Specification", link: "reference/specification" },
            ...openAPISidebarGroups,
          ],
        },
        {
          label: "Decisions",
          items: [
            "decisions/overview",
            {
              label: "ADRs",
              collapsed: true,
              autogenerate: { directory: "decisions/adr" },
            },
          ],
        },
      ],
    }),
  ],
});
