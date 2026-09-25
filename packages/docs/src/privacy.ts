export interface PrivacySection {
  heading: string;
  body: string;
}

export const privacyCollectedItems: string[] = [
  "필수: 이메일 주소",
  "선택: 연령대, 성별 — 신청 완료 후 별도로 여쭙는 항목이며, 입력하지 않아도 베타 신청에 아무런 불이익이 없습니다.",
  "자동 수집: 접속 일시(중복 신청 방지 목적)",
];

export const privacyPurposes: [string, string][] = [
  ["베타 서비스 오픈 및 정식 출시 안내", "이메일 주소"],
  ["연령대·성별에 맞는 강의 추천 구성 및 서비스 개선 통계", "선택 항목"],
];

export const privacySections: PrivacySection[] = [
  {
    heading: "3. 보유 및 이용 기간",
    body: "정식 출시 후 3개월까지 보유하며, 이용자가 수신거부 또는 삭제를 요청하는 경우 지체 없이 파기합니다.",
  },
  {
    heading: "4. 제3자 제공 및 위탁",
    body: "수집된 정보는 출시 알림 외 다른 용도로 사용되지 않으며, 법령에 따른 경우를 제외하고 제3자에게 제공하지 않습니다. 메일 발송을 위해 외부 발송 서비스에 처리를 위탁할 수 있으며, 위탁 시 수탁자와 처리 내용을 본 방침에 고지합니다.",
  },
  {
    heading: "5. 정보주체의 권리",
    body: "이용자는 언제든지 개인정보의 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청은 아래 연락처로 접수해 주세요.",
  },
  {
    heading: "6. 개인정보 보호책임자",
    body: "팀 스터디움 · pcentre@studium.rehab",
  },
];

export const privacyEffectiveDate = "2026-01-01";
