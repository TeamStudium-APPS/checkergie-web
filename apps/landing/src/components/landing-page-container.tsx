"use client";

import type { AgeGroup, Gender } from "@checkergie/api";
import { useSaveWaitlistProfile, useSubscribeWaitlist } from "@checkergie/api/query";
import {
  finishFailedSubscription,
  forgetUnconfirmedSubscription,
  hasUnconfirmedSubscription,
  rememberUnconfirmedSubscription,
} from "src/client/waitlist/unconfirmed-subscription";
import LandingPage, { type SurveyConnection } from "./landing-page";
import ProfileModal from "./landing-modals/profile-modal";

const LandingPageContainer = () => {
  const subscribe = useSubscribeWaitlist();
  const saveProfile = useSaveWaitlistProfile();

  // ==================== 등록: 대기 명단에 이메일 보내기 ====================

  const handleSubscribeWaitlist = async (email: string) => {
    const wasUnconfirmed = await hasUnconfirmedSubscription(email);
    await rememberUnconfirmedSubscription(email);
    try {
      await subscribe.mutateAsync({ email });
      forgetUnconfirmedSubscription();
    } catch (error) {
      finishFailedSubscription(error, wasUnconfirmed);
    }
  };

  // ==================== 설문: 설문 응답 저장과 모달 연결 ====================

  const handleSaveSurveyAnswers = async (email: string, { ageGroup, gender }: { ageGroup?: AgeGroup; gender?: Gender }) => {
    await saveProfile.mutateAsync({ email, ageGroup: ageGroup ?? null, gender: gender ?? null });
  };

  const renderSurveyModal = (props: SurveyConnection) => (
    <ProfileModal {...props} onSave={(answers) => handleSaveSurveyAnswers(props.email, answers)} />
  );

  return <LandingPage submitSubscribe={handleSubscribeWaitlist} renderSurvey={renderSurveyModal} />;
};
export default LandingPageContainer;
