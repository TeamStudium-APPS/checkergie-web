import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: "../../apps/landing/next.config.ts",
    },
  },
  docs: {
    defaultName: "Documentation",
  },
};

export default config;
