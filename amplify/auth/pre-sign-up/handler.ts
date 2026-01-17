import type { PreSignUpTriggerHandler } from "aws-lambda";

export const handler: PreSignUpTriggerHandler = async (event) => {
  // Auto-confirm the user
  event.response.autoConfirmUser = true;

  // Auto-verify email so user doesn't need to verify it
  event.response.autoVerifyEmail = true;

  return event;
};
