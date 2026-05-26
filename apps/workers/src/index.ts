import { serve } from "inngest/node";
import { inngest } from "./inngest/client";
import { helloIvy } from "./inngest/functions/hello";
import { createServer } from "http";

const handler = serve({
  client: inngest,
  functions: [helloIvy],
});

const port = process.env["PORT"] ?? "3001";

createServer(handler).listen(Number(port), () => {
  console.log(`Ivy workers ready on port ${port}`);
});
