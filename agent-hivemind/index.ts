import { Mastra } from "@mastra/core/mastra";
import { hivemindAgent } from "./agents/hivemindAgent";

export const mastra = new Mastra({
  agents: { hivemindAgent },
});

