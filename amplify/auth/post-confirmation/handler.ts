import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/post-confirmation";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    await client.models.Player.create({
      email: event.request.userAttributes.email,
      score: 0,
      username: event.userName,
      activeGuess: null,
    });
  } catch (error) {
    throw new Error("Error creating player in post-confirmation", {
      cause: error,
    });
  }
};
