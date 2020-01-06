import middy from "@middy/core";
import chromium from "chrome-aws-lambda";
import { APIGatewayEvent } from "aws-lambda";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

const handler = async (event: APIGatewayEvent) => {
  const executablePath = process.env.IS_OFFLINE
    ? null
    : await chromium.executablePath;
  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath
  });
  const page = await browser.newPage();
  const myContent = "happy new year!!";
  await page.setContent(myContent);
  const stream = await page.pdf();

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-type": "application/pdf"
    },
    body: stream.toString("base64")
  };
};

export const generate = middy(handler).use(doNotWaitForEmptyEventLoop());
