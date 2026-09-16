import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../../atoms/button";
import { TextField } from "../../atoms/text-field";
import Form from "./form";

const meta = {
  title: "Organisms/Form",
  component: Form,
  decorators: [(StoryComponent) => <div className="w-[min(92vw,480px)] rounded-cg-lg bg-cg-surface p-6 shadow-cg-card"><StoryComponent /></div>],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Form>
      <Form.Field name="email" label="이메일" required help="베타 오픈 소식을 보내드릴게요.">
        <TextField type="email" placeholder="hello@checkergie.kr" />
      </Form.Field>
      <Form.Actions>
        <Button type="submit">저장하기</Button>
      </Form.Actions>
    </Form>
  ),
};

export const ServerError: Story = {
  render: () => (
    <Form errors={{ email: "이미 등록된 이메일입니다." }}>
      <Form.Field name="email" label="이메일">
        <TextField defaultValue="hello@checkergie.kr" />
      </Form.Field>
      <Form.Actions>
        <Button type="submit">다시 시도</Button>
      </Form.Actions>
    </Form>
  ),
};
