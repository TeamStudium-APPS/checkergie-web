import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../shared/cn";
import { FoundationPage, TokenCode } from "./foundation-layout";

const layers = [
  {
    name: "dropdown",
    value: 30,
    usage: "메뉴와 드롭다운",
    color: "bg-cg-text",
    inspectorColor: "border-cg-border-strong bg-cg-subtle text-cg-text",
  },
  {
    name: "sticky",
    value: 40,
    usage: "고정 헤더",
    color: "bg-cg-info",
    inspectorColor: "border-cg-info bg-cg-info-soft text-cg-info",
  },
  {
    name: "overlay",
    value: 50,
    usage: "모달과 딤드",
    color: "bg-cg-brand",
    inspectorColor: "border-cg-brand bg-cg-brand-soft text-cg-brand",
  },
  {
    name: "toast",
    value: 60,
    usage: "전역 알림",
    color: "bg-cg-success",
    inspectorColor: "border-cg-success bg-cg-success-soft text-cg-success",
  },
] as const;

const initialRotation = { x: 54, z: -28 };

const ZIndex = () => {
  return null;
};

const meta = {
  title: "Foundation/Z-Index",
  component: ZIndex,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ZIndex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Layers: Story = {
  render: () => (
    <FoundationPage
      title="Z-Index"
      description="레이어 순서는 의미 기반 z-index 토큰으로 관리합니다. 표로 값을 확인하고 3D 스택으로 실제 쌓임 순서를 살펴볼 수 있습니다."
    >
      <div className="overflow-x-auto rounded-cg-md border border-cg-border">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead className="bg-cg-subtle text-cg-label-sm text-cg-muted">
            <tr>
              <th className="px-4 py-3 font-cg-semibold">Order</th>
              <th className="px-4 py-3 font-cg-semibold">Token</th>
              <th className="px-4 py-3 font-cg-semibold">Usage</th>
              <th className="px-4 py-3 text-right font-cg-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((layer, index) => (
              <tr key={layer.name} className="border-t border-cg-border">
                <td className="px-4 py-4 font-cg-mono text-cg-caption-sm text-cg-caption cg-tabular-nums">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <TokenCode>z-cg-{layer.name}</TokenCode>
                </td>
                <td className="px-4 py-4 text-cg-body-sm text-cg-muted">{layer.usage}</td>
                <td className="px-4 py-4 text-right font-cg-mono text-cg-caption-sm cg-tabular-nums">
                  {layer.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LayerStack />
    </FoundationPage>
  ),
};

const LayerStack = () => {
  const [exploded, setExploded] = useState(true);
  const [rotation, setRotation] = useState(initialRotation);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const depthStep = 76;
  const spread = depthStep * (layers.length - 1);
  const recenterY = exploded
    ? (spread * Math.sin((rotation.x * Math.PI) / 180)) / 2
    : 0;

  const rotate = (deltaX: number, deltaZ: number) => {
    setRotation((current) => ({
      x: Math.max(18, Math.min(78, current.x + deltaX)),
      z: current.z + deltaZ,
    }));
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!exploded) return;
    const movement = 4;
    if (event.key === "ArrowUp") rotate(-movement, 0);
    else if (event.key === "ArrowDown") rotate(movement, 0);
    else if (event.key === "ArrowLeft") rotate(0, -movement);
    else if (event.key === "ArrowRight") rotate(0, movement);
    else return;
    event.preventDefault();
  };

  return (
    <section className="mt-8" aria-labelledby="z-index-stack-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="z-index-stack-title" className="text-cg-title-lg text-cg-ink">
            {exploded ? "Layer stack" : "Layer inspector"}
          </h2>
          <p className="mt-1 text-cg-body-sm text-cg-muted">
            {exploded
              ? "위에 있는 레이어일수록 사용자에게 먼저 보입니다. 화면을 드래그하거나 방향키로 회전할 수 있습니다."
              : "개발자 도구의 박스 모델처럼 바깥에서 안쪽으로 우선순위를 읽습니다. DOM 중첩이 아니라 z-index 순서를 나타냅니다."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exploded ? (
            <button
              type="button"
              onClick={() => setRotation(initialRotation)}
              className="h-9 cursor-pointer rounded-cg-full border border-cg-border bg-cg-surface px-4 text-cg-label-sm text-cg-text transition-colors duration-cg-base hover:border-cg-border-strong hover:text-cg-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cg-brand/20 active:bg-cg-subtle motion-reduce:transition-none"
            >
              시점 초기화
            </button>
          ) : null}
          <button
            type="button"
            aria-pressed={exploded}
            onClick={() => setExploded((current) => !current)}
            className="h-9 cursor-pointer rounded-cg-full bg-cg-brand px-4 text-cg-label-sm text-white transition-[background-color,transform] duration-cg-base hover:bg-cg-brand-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cg-brand/25 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {exploded ? "2D 인스펙터" : "3D로 분해하기"}
          </button>
        </div>
      </div>

      <div
        role="img"
        tabIndex={exploded ? 0 : undefined}
        aria-label={`Checkergie z-index 레이어 ${exploded ? "3D 분해" : "2D 인스펙터"} 시각화. 낮은 우선순위부터 dropdown 30, sticky 40, overlay 50, toast 60 순서입니다.`}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          if (!exploded) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragState.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const previous = dragState.current;
          if (!previous || previous.pointerId !== event.pointerId) return;
          rotate(-(event.clientY - previous.y) * 0.35, (event.clientX - previous.x) * 0.35);
          dragState.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        }}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={cn(
          "mt-4 flex touch-none items-center justify-center overflow-hidden rounded-cg-lg border border-cg-border bg-cg-canvas outline-none transition-all duration-cg-slow ease-cg-emphasized focus-visible:ring-3 focus-visible:ring-cg-brand/20 motion-reduce:transition-none",
          exploded ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
        )}
        style={{
          height: exploded ? "clamp(380px, 52vw, 500px)" : "320px",
          perspective: "1200px",
        }}
      >
        {exploded ? (
          <div
            aria-hidden="true"
            className="relative transition-transform duration-cg-slow ease-cg-emphasized motion-reduce:transition-none"
            style={{
              width: "min(76vw, 420px)",
              height: "144px",
              transformStyle: "preserve-3d",
              transform: `translateY(${recenterY}px) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
            }}
          >
            {layers.map((layer, index) => (
              <div
                key={layer.name}
                className={cn(
                  "absolute inset-0 flex items-center justify-between gap-4 rounded-cg-md border border-white/30 px-5 text-white shadow-cg-float [backface-visibility:hidden]",
                  layer.color,
                )}
                style={{
                  backfaceVisibility: "hidden",
                  transform: `translateZ(${index * depthStep}px)`,
                  transition: dragging ? "none" : "transform 240ms var(--ease-cg-emphasized)",
                }}
              >
                <div>
                  <p className="text-cg-label-sm text-white/80">z-cg-{layer.name}</p>
                  <p className="mt-1 text-cg-title-md text-white">{layer.usage}</p>
                </div>
                <span className="rounded-cg-full bg-black/25 px-2.5 py-1 font-cg-mono text-cg-caption-sm cg-tabular-nums">
                  {layer.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <LayerInspector />
        )}
      </div>
    </section>
  );
};

const LayerInspector = () => {
  return (
    <div
      aria-hidden="true"
      className="relative"
      style={{ width: "min(82vw, 520px)", height: "260px" }}
    >
      {layers.map((layer, index) => (
        <div
          key={layer.name}
          className={cn(
            "absolute rounded-cg-sm border shadow-cg-sm",
            layer.inspectorColor,
          )}
          style={{ inset: `${index * 26}px`, zIndex: index }}
        >
          <div
            className="flex items-center justify-between gap-3 px-3 font-cg-mono text-cg-caption-sm cg-tabular-nums"
            style={{ height: "26px" }}
          >
            <span>z-cg-{layer.name}</span>
            <span>{layer.value}</span>
          </div>
          {index === layers.length - 1 ? (
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center px-4 text-center"
              style={{ top: "26px" }}
            >
              <div>
                <p className="text-cg-caption-sm">Top layer</p>
                <p className="mt-1 text-cg-title-md">{layer.usage}</p>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
