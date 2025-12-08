import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { hivemindAgent } from "./agents/hivemindAgent";

export const mastra = new Mastra({
  agents: { hivemindAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
});

