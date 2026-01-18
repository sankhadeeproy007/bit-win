import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/post-confirmation";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  try {
    // Create the player record with Cognito user ID as the primary key
    await client.models.Player.create({
      id: userId,
      email: email,
      score: 0,
      activeGuess: null,
      leaderboardGroup: "GLOBAL",
    });
  } catch (error) {
    throw new Error("Error creating player in post-confirmation", {
      cause: error,
    });
  }
  return event;
};
