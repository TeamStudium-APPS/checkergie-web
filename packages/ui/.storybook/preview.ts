import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/storybook.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    options: {
      storySort: {
        order: ["Foundation", "Atoms", "Molecules", "Organisms"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
