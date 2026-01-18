import { defineFunction } from "@aws-amplify/backend";

export const placeGuess = defineFunction({
  name: "place-guess",
  entry: "./handler.ts",
});
