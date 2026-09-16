import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../../atoms/button";
import Modal from "./modal";

const meta = {
  title: "Organisms/Modal",
  component: Modal,
  parameters: { layout: "centered" },
  args: {
    open: false,
    onOpenChange: () => undefined,
    title: "알레르기 정보 저장",
    description: "입력한 정보는 맞춤형 식품 정보를 제공하는 데 사용됩니다.",
    children: null,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="알레르기 정보 저장"
        description="입력한 정보는 맞춤형 식품 정보를 제공하는 데 사용됩니다."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
            <Button onClick={() => setOpen(false)}>저장하기</Button>
          </>
        }
      >
        <p className="py-3 leading-7 text-cg-text">
          입력 내용을 확인한 뒤 저장해 주세요. 언제든 설정에서 수정할 수 있습니다.
        </p>
      </Modal>
    </>
  );
};

export const Default: Story = {
  args: {},
  render: () => <ModalExample />,
};
