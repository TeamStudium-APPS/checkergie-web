"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check, MapPin, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { FormField } from "../../molecules/form-field";
import { Button } from "../button";
import TextField, { type TextFieldProps } from "./text-field";

const IconAction = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-9 cursor-pointer touch-manipulation items-center justify-center rounded-full text-cg-muted transition-colors duration-150 hover:bg-cg-subtle hover:text-cg-ink active:bg-cg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/20"
    >
      {children}
    </button>
  );
};

const meta = {
  title: "Atoms/TextField",
  component: TextField,
  args: {
    placeholder: "이메일 주소를 입력해 주세요…",
    "aria-label": "이메일 주소",
    size: "lg",
  },
  decorators: [(StoryComponent) => <div className="w-[min(92vw,466px)]"><StoryComponent /></div>],
  parameters: {
    docs: {
      description: {
        component:
          "TextField는 입력과 좌우 슬롯을 담당합니다. 화면에 보이는 label, help, error message는 FormField와 조합해 일관된 간격과 aria 연결을 유지합니다. leadingIcon/trailingIcon은 장식용이고, 버튼은 leadingAction/trailingAction에 넣습니다.",
      },
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledTextField = (args: TextFieldProps) => {
  const [value, setValue] = useState("");
  return <TextField {...args} value={value} onValueChange={setValue} />;
};

export const WithoutVisibleLabel: Story = {
  name: "Without visible label",
  render: (args) => <ControlledTextField {...args} />,
  parameters: {
    docs: {
      description: {
        story: "화면 라벨을 생략할 때도 aria-label 또는 aria-labelledby로 접근 가능한 이름을 제공해야 합니다.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <FormField name="email" label="이메일 주소" required help="가입 안내를 받을 주소를 입력해 주세요.">
      <TextField {...args} aria-label={undefined} type="email" autoComplete="email" name="email" />
    </FormField>
  ),
};

export const ErrorMessage: Story = {
  name: "Error message",
  render: (args) => (
    <FormField name="email" label="이메일 주소" required error="이메일 형식을 확인해 주세요.">
      <TextField {...args} aria-label={undefined} type="email" defaultValue="wrong-email" />
    </FormField>
  ),
};

export const WithIcons: Story = {
  args: {
    "aria-label": "검색어",
    placeholder: "검색어를 입력해 주세요…",
    leadingIcon: <Search className="size-5" />,
    trailingIcon: <Check className="size-5 text-cg-success" />,
  },
  parameters: {
    docs: {
      description: {
        story: "장식 아이콘은 입력 종류나 상태를 보조하며 자동으로 접근성 트리에서 제외됩니다.",
      },
    },
  },
};

export const WithSideActions: Story = {
  name: "With side actions",
  args: {
    "aria-label": "위치",
    placeholder: "위치를 입력해 주세요…",
    leadingAction: (
      <IconAction label="현재 위치 사용">
        <MapPin className="size-5" />
      </IconAction>
    ),
    trailingAction: <Button size="sm">검색</Button>,
  },
  parameters: {
    docs: {
      description: {
        story: "포커스 가능한 버튼은 icon 슬롯이 아니라 action 슬롯에 넣어야 스크린리더와 키보드로 조작할 수 있습니다.",
      },
    },
  },
};

export const Clearable: Story = {
  args: { defaultValue: "hello@checkergie.kr", clearable: true },
};

export const Disabled: Story = {
  args: { defaultValue: "입력할 수 없는 값", disabled: true },
};
