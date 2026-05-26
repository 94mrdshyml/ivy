import { inngest } from "../client";

export const helloIvy = inngest.createFunction(
  { id: "hello-ivy" },
  { event: "ivy/hello" },
  async () => {
    console.log("Ivy workers ready");
  },
);
