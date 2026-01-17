import {
  signIn as signInAuth,
  signUp as signUpAuth,
  autoSignIn,
  getCurrentUser,
} from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const createPlayer = async (userId: string, email: string) => {
  await client.models.Player.create(
    {
      id: userId,
      email,
      score: 0,
      activeGuess: null,
      leaderboardGroup: "GLOBAL",
    },
    { authMode: "apiKey" }
  );
};

export const signIn = async (email: string, password: string) => {
  await signInAuth({
    username: email,
    password,
  });
};

export const signUp = async (email: string, password: string) => {
  await signUpAuth({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
      autoSignIn: {
        enabled: true,
      },
    },
  });

  await autoSignIn();

  // Get the Cognito userId and create the player with it as the id
  const { userId } = await getCurrentUser();
  await createPlayer(userId, email);
};
