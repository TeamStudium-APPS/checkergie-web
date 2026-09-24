"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDownUp,
  Check,
  Headphones,
  MonitorPlay,
  Search,
  Sunrise,
} from "lucide-react";

const tabs = ["강의 찾기", "내 큐레이션", "완강 루틴"];
const courses = [
  {
    title: "한 달 완성 토익 RC 실전 패키지",
    meta: "난이도 3 · 총 18시간 · 후기 1,204",
    pro: "설명이 친절",
    con: "자료 업데이트",
    score: "6.2",
    match: "94%",
  },
  {
    title: "기초부터 다지는 LC 청취 훈련",
    meta: "난이도 2 · 총 12시간 · 후기 861",
    pro: "발음 교정",
    con: "진도 빠름",
    score: "5.8",
    match: "89%",
  },
  {
    title: "직장인 새벽 30분 영단어 루틴",
    meta: "난이도 1 · 총 8시간 · 후기 432",
    pro: "분량 적절",
    con: "예문 부족",
    score: "5.1",
    match: "82%",
  },
];

const BrowserPreview = () => {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (hovered || focused || reduced || !visible) return;
    const timer = window.setTimeout(
      () => setActive((value) => (value + 1) % tabs.length),
      3000,
    );
    return () => window.clearTimeout(timer);
  }, [active, hovered, focused, reduced, visible]);

  const select = (index: number) => {
    setActive(index);
    buttons.current[index]?.focus();
  };

  return (
    <div
      className="[--preview-surface:#353738] [--preview-card:#414344] [--preview-muted:#b8babb] [--preview-browser-chrome:#1d2021] [--preview-address:#0d1011] [--preview-window-close:#f26a5f] [--preview-window-minimize:#f5c34c] [--preview-window-expand:#61c454] [--preview-positive:#86e4ce] [--preview-negative:#ffc19f] [--preview-negative-background:#ff9560] bg-[var(--preview-surface)] border border-cg-surface/[0.2196] lg:h-full [&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[var(--hero-mint)] [&_button:focus-visible]:outline-offset-[-3px] overflow-clip rounded-cg-lg shadow-cg-modal text-cg-subtle"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="h-14 px-cg-5 gap-cg-6 bg-[var(--preview-browser-chrome)] [@media(width<=560px)]:h-11 [@media(width<=560px)]:px-cg-3 [@media(width<=560px)]:gap-cg-3 flex items-center">
        <span
          className="[&_i]:size-[11px] [&_i]:rounded-cg-full [&_i]:bg-[var(--preview-window-close)] [&_i:nth-child(2)]:bg-[var(--preview-window-minimize)] [&_i:nth-child(3)]:bg-[var(--preview-window-expand)] flex gap-cg-2"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
        <span
          className="py-1.5 px-cg-3 bg-[var(--preview-address)] text-[var(--landing-footer-surface)] text-cg-label-md flex-1 max-w-[360px] m-auto text-center rounded-cg-sm"
        >
          checkergie.rehab
        </span>
      </div>
      <div className="p-cg-5 [@media(width<=560px)]:p-cg-3">
        <div className="mb-[18px] border-b border-cg-surface/[0.051] [@media(width<=560px)]:gap-cg-3 flex items-center gap-cg-5">
          <span className="text-cg-label-md flex gap-cg-2 items-center whitespace-nowrap [@media(width<=560px)]:text-cg-caption-sm">
            <Image
              src="/logo.svg"
              alt=""
              width={20}
              height={20}
              className="shrink-0"
            />
            체커기
          </span>
          <div
            role="tablist"
            aria-label="서비스 미리보기"
            className="[&_button]:text-[11px] [&_button]:text-[var(--preview-muted)] [&_button]:whitespace-nowrap [&_button]:border-b-2 [&_button]:border-transparent [&_button[aria-selected=true]]:text-[var(--hero-mint)] [&_button[aria-selected=true]]:border-[var(--hero-mint)] flex gap-cg-4"
          >
            {tabs.map((label, index) => (
              <button
                key={label}
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`preview-tab-${index}`}
                aria-controls={`preview-panel-${index}`}
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % 3
                      : event.key === "ArrowLeft"
                        ? (index + 2) % 3
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    select(next);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid overflow-hidden">
          {tabs.map((label, index) => (
            <div
              key={label}
              id={`preview-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`preview-tab-${index}`}
              data-active={active === index}
              tabIndex={0}
              className="col-start-1 row-start-1 data-[active=false]:invisible focus-visible:outline-2 focus-visible:outline-[var(--hero-mint)] focus-visible:outline-offset-[-3px] data-[active=true]:animate-[landing-preview-panel-enter_var(--duration-cg-slow)_var(--ease-cg-standard)] motion-reduce:data-[active=true]:animate-none"
            >
              {index === 0 && (
                <>
                  <div
                    className="gap-2.5 bg-[var(--preview-card)] text-[var(--preview-muted)] [&_small]:inline-flex [&_small]:items-center [&_small]:gap-cg-1 [&_small]:ml-auto [&_small]:whitespace-nowrap [@media(width<=560px)]:p-cg-3 [@media(width<=560px)]:[&_small]:hidden text-cg-body-sm flex items-center p-cg-4 rounded-cg-md"
                  >
                    <Search size={18} aria-hidden="true" />
                    <span>토익 700점 목표 · 평일 저녁 40분</span>
                    <small>
                      <ArrowDownUp size={14} aria-hidden="true" /> 평점순
                    </small>
                  </div>
                  <div className="text-[11px] gap-[7px] my-cg-3 [&>span]:py-cg-2 [&>span]:px-2.5 [&>span]:bg-[var(--preview-card)] [&>span]:rounded-cg-full [&>span[data-selected=true]]:text-[var(--landing-on-accent)] [&>span[data-selected=true]]:bg-[var(--hero-mint)] [&>span[data-selected=true]]:font-cg-bold flex flex-wrap">
                    {[
                      "난이도 3",
                      "강의형",
                      "실습형",
                      "#단기완성",
                      "#자료충실",
                    ].map((tag, i) => (
                      <span key={tag} data-selected={i < 2}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {index === 1 && (
                <>
                  <div
                    className="gap-2.5 bg-[var(--preview-card)] text-[var(--preview-muted)] [&_small]:inline-flex [&_small]:items-center [&_small]:gap-cg-1 [&_small]:ml-auto [&_small]:whitespace-nowrap [@media(width<=560px)]:p-cg-3 [@media(width<=560px)]:[&_small]:hidden text-cg-body-sm flex items-center p-cg-4 rounded-cg-md"
                  >
                    내가 넣은 조건 <small>조건 수정</small>
                  </div>
                  <div className="text-[11px] gap-[7px] my-cg-3 [&>span]:py-cg-2 [&>span]:px-2.5 [&>span]:bg-[var(--preview-card)] [&>span]:rounded-cg-full [&>span[data-selected=true]]:text-[var(--landing-on-accent)] [&>span[data-selected=true]]:bg-[var(--hero-mint)] [&>span[data-selected=true]]:font-cg-bold flex flex-wrap">
                    {[
                      "목표 · 토익 700",
                      "수준 · 난이도 2~3",
                      "시간 · 저녁 40분",
                    ].map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </>
              )}
              {index < 2 ? (
                <>
                  <div
                    className="gap-2.5 my-3.5 text-[var(--preview-muted)] text-cg-caption-sm flex justify-between"
                  >
                    <span>
                      {index === 0 ? "1,284개 중 37개" : "조건에 맞는 강의 6개"}
                    </span>
                    <span>{index === 0 ? "조건 2개 적용" : "매칭도순"}</span>
                  </div>
                  <div className="gap-2.5 grid">
                    {courses.map((course, i) => (
                      <div
                        className="min-h-[100px] gap-3.5 p-3.5 bg-[var(--preview-card)] border border-cg-surface/[0.0471] [@media(width<=560px)]:gap-cg-2 [@media(width<=560px)]:p-cg-3 flex items-center rounded-cg-md"
                        key={course.title}
                      >
                        <span
                          className="size-[46px] border border-cg-surface/[0.1255] text-[var(--preview-muted)] [@media(width<=560px)]:hidden text-cg-heading-md shrink-0 grid place-items-center rounded-cg-sm"
                          aria-hidden="true"
                        >
                          {i === 0 ? (
                            <MonitorPlay size={24} />
                          ) : i === 1 ? (
                            <Headphones size={24} />
                          ) : (
                            <Sunrise size={24} />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <strong className="text-cg-label-md">{course.title}</strong>
                          <p className="text-cg-caption-sm">{course.meta}</p>
                          <div
                            className="gap-1.5 [&_span]:py-cg-1 [&_span]:px-1.5 [&_span]:text-[var(--preview-positive)] [&_span]:bg-[color-mix(in_srgb,var(--landing-accent)_10.98%,transparent)] [&_span]:rounded-cg-xs [&_span+span]:text-[var(--preview-negative)] [&_span+span]:bg-[color-mix(in_srgb,var(--preview-negative-background)_13.33%,transparent)] text-cg-caption-sm flex flex-wrap mt-cg-2"
                          >
                            <span>PRO {course.pro}</span>
                            {index === 0 && <span>CON {course.con}</span>}
                          </div>
                        </div>
                        <div className="gap-1.5 [&_small]:text-[var(--preview-muted)] grid text-right">
                          <strong className="text-cg-title-lg">
                            {index === 0 ? course.score : course.match}
                          </strong>
                          <small className="text-cg-caption-sm">
                            {index === 0 ? "/ 7.0" : "매칭"}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid-cols-7 gap-[5px] [&>span]:grid [&>span]:gap-cg-2 [&>span]:py-cg-3 [&>span]:text-center [&>span]:bg-[var(--preview-card)] [&>span]:rounded-cg-sm [&>span]:text-cg-caption-sm [&_b]:font-cg-medium [&>span[data-done=true]]:text-[var(--hero-mint)] [&>span[data-done=true]]:bg-[color-mix(in_srgb,var(--landing-accent)_9.41%,transparent)] grid">
                    {["월", "화", "수", "목", "금", "토", "일"].map(
                      (day, i) => (
                        <span key={day} data-done={i < 4}>
                          {day}
                          <b>
                            {
                              [
                                "완료",
                                "완료",
                                "완료",
                                "오늘",
                                "40분",
                                "휴식",
                                "복습",
                              ][i]
                            }
                          </b>
                        </span>
                      ),
                    )}
                  </div>
                  <div
                    className="gap-2.5 my-3.5 text-[var(--preview-muted)] text-cg-caption-sm flex justify-between"
                  >
                    <span>이번 주 3/5 완료</span>
                    <span>오늘 40분 예정</span>
                  </div>
                  <div className="gap-2.5 grid">
                    {[
                      "RC Part 5 — 접속사 정리",
                      "LC Part 2 — 의문사 문제",
                      "어제 틀린 문장 5개 복습",
                    ].map((task, i) => (
                      <div
                        className="min-h-[100px] gap-3.5 p-3.5 bg-[var(--preview-card)] border border-cg-surface/[0.0471] [@media(width<=560px)]:gap-cg-2 [@media(width<=560px)]:p-cg-3 flex items-center rounded-cg-md"
                        key={task}
                      >
                        <span
                          className="inline-grid place-items-center shrink-0 size-cg-5 border border-cg-surface/25 rounded-[6px] data-[completed=true]:bg-[var(--landing-accent)] data-[completed=true]:border-[var(--landing-accent)] data-[completed=true]:text-[var(--landing-on-accent)]"
                          data-completed={i === 0}
                          role="img"
                          aria-label={i === 0 ? "완료" : "미완료"}
                        >
                          {i === 0 && (
                            <Check
                              size={14}
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <strong className="text-cg-label-md">{task}</strong>
                          <p className="text-cg-caption-sm">
                            {
                              [
                                "한 달 완성 토익 RC · 3/8회차",
                                "기초 LC 청취 훈련 · 2/6회차",
                                "자동 생성 · 복습",
                              ][i]
                            }
                          </p>
                        </div>
                        <small>{[18, 14, 8][i]}분</small>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] gap-[7px] my-cg-3 [&>span]:py-cg-2 [&>span]:px-2.5 [&>span]:bg-[var(--preview-card)] [&>span]:rounded-cg-full [&>span[data-selected=true]]:text-[var(--landing-on-accent)] [&>span[data-selected=true]]:bg-[var(--hero-mint)] [&>span[data-selected=true]]:font-cg-bold flex flex-wrap">
                    <span>12일 연속</span>
                    <span>완주 뱃지 3/4</span>
                    <span>주 5회 목표</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowserPreview;
