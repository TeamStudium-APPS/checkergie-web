"use client";

import { useSaveWaitlistProfile, useSubscribeWaitlist } from "@checkergie/api/query";
import LandingPage from "./landing-page";
import ProfileModal from "./landing-modals/profile-modal";

const LandingPageContainer = () => {
  const subscribe = useSubscribeWaitlist();
  const saveProfile = useSaveWaitlistProfile();

  return (
    <LandingPage
      submitSignup={async (email) => { await subscribe.mutateAsync({ email }); }}
      renderSurvey={(props) => (
        <ProfileModal
          {...props}
          onSave={async ({ ageGroup, gender }) => {
            await saveProfile.mutateAsync({ email: props.email, ageGroup: ageGroup ?? null, gender: gender ?? null });
          }}
        />
      )}
    />
  );
};
export default LandingPageContainer;
