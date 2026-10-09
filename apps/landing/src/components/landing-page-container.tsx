"use client";

import type { AgeGroup, Gender } from "@checkergie/api";
import { useSaveWaitlistProfile, useSubscribeWaitlist } from "@checkergie/api/query";
import LandingPage, { type SurveyConnection } from "./landing-page";
import ProfileModal from "./landing-modals/profile-modal";

const LandingPageContainer = () => {
  const subscribe = useSubscribeWaitlist();
  const saveProfile = useSaveWaitlistProfile();

  const handleSubscribeWaitlist = async (email: string) => {
    await subscribe.mutateAsync({ email });
  };

  const handleSaveSurveyAnswers = async (email: string, { ageGroup, gender }: { ageGroup?: AgeGroup; gender?: Gender }) => {
    await saveProfile.mutateAsync({ email, ageGroup: ageGroup ?? null, gender: gender ?? null });
  };

  const renderSurveyModal = (props: SurveyConnection) => (
    <ProfileModal {...props} onSave={(answers) => handleSaveSurveyAnswers(props.email, answers)} />
  );

  return <LandingPage submitSignup={handleSubscribeWaitlist} renderSurvey={renderSurveyModal} />;
};
export default LandingPageContainer;
