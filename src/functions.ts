import { Markup, Telegraf } from "telegraf";
import type { MyContext } from "./main";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

// prisma client
const prisma = new PrismaClient();

export async function handleStarCommand(ctx: MyContext) {
  console.log("Start command");

  // Store the user information to database while user start the bot.
  const tgUser = ctx.from!;

  // Store to context if not exist
  if (!ctx.session) {
    ctx.session = { userCoin: new Map<number, any>() };
    ctx.session!.userCoin = new Map();
    ctx.session!.userCoin.set(tgUser.id, { telegramId: tgUser.id, coin: 0 });
  }

  // Check if user already exist in database
  const user = await prisma.user.findUnique({
    where: {
      telegramId: tgUser.id,
    },
  });
  if (!user) {
    await prisma.user.create({
      data: {
        telegramId: tgUser.id,
        username: tgUser.username!,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        languageCode: tgUser.language_code,
      },
    });
  }

  // send welcome message
  return sendWelcomeMessage(ctx);
}

export async function sendWelcomeMessage(ctx: MyContext) {
  await ctx.reply(
    "Welcome to the bot!, you can claim 1 free coin for every 1 hour. click this button to claim. Enjoy!",
    Markup.keyboard([["🤑 Claim Now"]])
      .oneTime()
      .resize()
  );
}

export async function claimCoin(ctx: MyContext) {
  console.log("Claim button clicked");

  // Update the user coin in the session
  const usr = ctx.session!.userCoin.get(ctx.from!.id);
  if (usr) {
    usr.coin += 1;
  }
  // Send a message
  await ctx.reply(
    `You have claimed 1 free coin!. your total coin is ${usr?.coin}`
  );
}

export async function applySchedule(bot: Telegraf<MyContext>) {
  cron.schedule("* * * * *", async () => {
    // fetch all user
    const users = await prisma.user.findMany();
    for (const user of users) {
      bot.telegram.sendMessage(
        user.telegramId,
        "You can claim 1 free coin now. Click this button to claim",
        Markup.keyboard([["🤑 Claim Now"]])
        .oneTime()
        .resize()
      );
    }
  });
}
