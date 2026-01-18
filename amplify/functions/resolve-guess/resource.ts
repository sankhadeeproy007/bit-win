import { defineFunction } from "@aws-amplify/backend";

export const resolveGuess = defineFunction({
  name: "resolve-guess",
  entry: "./handler.ts",
});
