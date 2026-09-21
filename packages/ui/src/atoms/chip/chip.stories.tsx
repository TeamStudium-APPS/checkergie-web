"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { useState } from "react";
import Chip from "./chip";

const meta = {
  title: "Atoms/Chip",
  component: Chip,
  args: { label: "20대" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

const ChoiceExample = (props: ComponentProps<typeof Chip>) => {
  const [selected, setSelected] = useState(false);
  return <Chip {...props} selected={selected} onPress={() => setSelected((value) => !value)} />;
};

export const Choice: Story = {
  render: (args) => <ChoiceExample {...args} />,
};

export const Selected: Story = { args: { selected: true } };
export const Static: Story = { args: { variant: "static", label: "#단기완성", tone: "brand" } };
export const Removable: Story = { args: { variant: "removable", label: "실습형" } };
export const Disabled: Story = { args: { disabled: true } };
