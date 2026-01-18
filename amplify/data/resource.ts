import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { placeGuess } from "../functions/place-guess/resource";
import { resolveGuess } from "../functions/resolve-guess/resource";

const schema = a
  .schema({
    Todo: a
      .model({
        content: a.string(),
      })
      .authorization((allow) => [allow.publicApiKey()]),
    Player: a
      .model({
        email: a.string(),
        score: a.integer(),
        activeGuess: a.json(),
        // Partition key for leaderboard GSI - all players share the same value
        leaderboardGroup: a.string().default("GLOBAL"),
      })
      .secondaryIndexes((index) => [
        index("leaderboardGroup").sortKeys(["score"]).name("byScore"),
      ])
      .authorization((allow) => [allow.publicApiKey()]),

    // Custom type for place guess result
    PlaceGuessResult: a.customType({
      direction: a.string().required(),
      priceAtGuess: a.float().required(),
      guessedAt: a.string().required(),
    }),

    // Custom mutation to place a guess - handled by Lambda
    placeGuess: a
      .mutation()
      .arguments({
        playerId: a.string().required(),
        direction: a.enum(["up", "down"]),
      })
      .returns(a.ref("PlaceGuessResult"))
      .handler(a.handler.function(placeGuess))
      .authorization((allow) => [allow.publicApiKey()]),

    // Custom type for resolve guess result
    ResolveGuessResult: a.customType({
      resolved: a.boolean().required(),
      isCorrect: a.boolean(),
      timerRestarted: a.boolean().required(),
    }),

    // Custom mutation to resolve a guess - handled by Lambda
    resolveGuess: a
      .mutation()
      .arguments({
        playerId: a.string().required(),
      })
      .returns(a.ref("ResolveGuessResult"))
      .handler(a.handler.function(resolveGuess))
      .authorization((allow) => [allow.publicApiKey()]),
  })
  // Grant Lambda functions access to query and mutate Player records
  .authorization((allow) => [
    allow.resource(postConfirmation).to(["mutate"]),
    allow.resource(placeGuess).to(["query", "mutate"]),
    allow.resource(resolveGuess).to(["query", "mutate"]),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
