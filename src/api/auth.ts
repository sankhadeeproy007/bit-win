import {
  signIn as signInAuth,
  signUp as signUpAuth,
  autoSignIn,
} from "aws-amplify/auth";

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
};
