import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { placeGuess } from "../functions/place-guess/resource";
import { resolveGuess } from "../functions/resolve-guess/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
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

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
