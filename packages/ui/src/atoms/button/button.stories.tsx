import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Button from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: {
    children: "알림 받기",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = {
  args: { fullWidth: true, size: "lg" },
  decorators: [(StoryComponent) => <div className="w-80"><StoryComponent /></div>],
};
