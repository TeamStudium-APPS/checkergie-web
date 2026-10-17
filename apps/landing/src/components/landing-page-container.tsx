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

  const handleSubscribeWaitlist = async (email: string) => {
    const hasUnconfirmedAttempt = await hasUnconfirmedSubscription(email);
    await rememberUnconfirmedSubscription(email);
    try {
      await subscribe.mutateAsync({ email });
      forgetUnconfirmedSubscription();
    } catch (error) {
      finishFailedSubscription(error, hasUnconfirmedAttempt);
    }
  };

  const handleSaveSurveyAnswers = async (email: string, { ageGroup, gender }: { ageGroup?: AgeGroup; gender?: Gender }) => {
    await saveProfile.mutateAsync({ email, ageGroup: ageGroup ?? null, gender: gender ?? null });
  };

  const renderSurveyModal = (props: SurveyConnection) => (
    <ProfileModal {...props} onSave={(answers) => handleSaveSurveyAnswers(props.email, answers)} />
  );

  return (
    <LandingPage
      onSubscribe={handleSubscribeWaitlist}
      renderSurvey={renderSurveyModal}
    />
  );
};
export default LandingPageContainer;
