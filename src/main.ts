import { Context, session, Telegraf } from "telegraf";
import { claimCoin, handleStarCommand } from "./functions";

// TODO
// 1. Sesion work [DONE]
// 2. Interact with DB [DONE]
// 4. Interact with button [ONGOING]
// 3. Send schedule message to registered user.

interface User {
  telegramId: number;
  coin: number;
}

interface SessionData {
  userCoin: Map<number, any>;
}

// Define your own context type
export interface MyContext extends Context {
  session?: SessionData;
}

const bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

// Logger
bot.use(Telegraf.log());

// Make session data available
bot.use(session({}));

bot.start(handleStarCommand);

// Listen for the claim button
bot.hears("🤑 Claim Now", async (ctx) => {
  return claimCoin(ctx);
});

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
