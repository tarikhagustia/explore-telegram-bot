// import { Context, session, Telegraf } from "telegraf";
// import { applySchedule, claimCoin, handleStarCommand } from "./functions";

// // TODO
// // 1. Sesion work [DONE]
// // 2. Interact with DB [DONE]
// // 4. Interact with button [DONE]
// // 3. Send schedule message to registered user [DONE]

// interface User {
//   telegramId: number;
//   coin: number;
// }

// interface SessionData {
//   userCoin: Map<number, any>;
// }

// // Define your own context type
// export interface MyContext extends Context {
//   session?: SessionData;
// }

// const bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

// // Logger
// bot.use(Telegraf.log());

// // Make session data available
// bot.use(session({}));

// bot.start(handleStarCommand);

// // Listen for the claim button
// bot.hears("🤑 Claim Now", async (ctx) => {
//   return claimCoin(ctx);
// });

// // Apply schedule
// applySchedule(bot);

// // Launch bot
// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// bot.launch();

// // Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

import { Composer, Markup, Scenes, session, Telegraf } from "telegraf";

const posibilities = ["rock", "paper", "scissors"];

export function randomChoice() {
  return posibilities[Math.floor(Math.random() * posibilities.length)];
}

let botWin = 0;
let playerWin = 0;

// Function for winning
function isWin(player: string, bot: string) {
  return (
    (player === "rock" && bot === "scissors") ||
    (player === "scissors" && bot === "paper") ||
    (player === "paper" && bot === "rock")
  );
}

async function applyGame(ctx: any) {
  await ctx.reply("Thinking ...");
  const msg = ctx.callbackQuery as any;
  const random = randomChoice();
  const win = isWin(msg.data, random);
  if (msg.data != random) {
    if (win) {
      playerWin += 1;
      await ctx.reply(
        `You win! You choose ${msg.data} and I choose ${random}. ah crap! another one!`
      );
    } else {
      botWin += 1;
      await ctx.reply(
        `You lose! You choose ${msg.data} and I choose ${random}. Next!`
      );
    }
  } else {
    await ctx.reply(
      `You draw! You choose ${msg.data} and I choose ${random}. Next!`
    );
  }

  await ctx.reply(
    "What do you choose?",
    Markup.inlineKeyboard([
      Markup.button.callback("🪨 Rock", "rock"),
      Markup.button.callback("📄 Paper", "paper"),
      Markup.button.callback("✂️ Scissors", "scissors"),
    ])
  );
}

const superWizard = new Scenes.WizardScene(
  "super-wizard",
  async (ctx) => {
    await ctx.reply(
      `Howdy ${ctx.from?.first_name} 🤠. wanna play a game? Click the button to play rock-paper-scissors!`,
      Markup.inlineKeyboard([Markup.button.callback("➡️ Let's go!", "next")])
    );
    return ctx.wizard.next();
  },
  // stepHandler,
  async (ctx) => {
    await ctx.reply("Let's play rock-paper-scissors!");
    await ctx.reply(`I have choose in my mind! :D`);
    await ctx.reply(
      "What do you choose?",
      Markup.inlineKeyboard([
        Markup.button.callback("🪨 Rock", "rock"),
        Markup.button.callback("📄 Paper", "paper"),
        Markup.button.callback("✂️ Scissors", "scissors"),
      ])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    applyGame(ctx);
    return ctx.wizard.next();
  },
  async (ctx) => {
    applyGame(ctx);
    return ctx.wizard.next();
  },
  async (ctx) => {
    applyGame(ctx);
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (playerWin > botWin) {
      await ctx.reply(
        `You win! You win ${playerWin} times and I win ${botWin} times!`
      );
    } else {
      await ctx.reply(
        `You lose! You win ${playerWin} times and I win ${botWin} times!`
      );
      ctx.replyWithPhoto({
        source: "./src/cat.png",
      });
    }
    playerWin = 0;
    botWin = 0;
    return await ctx.scene.leave();
  }
);

const bot = new Telegraf<Scenes.WizardContext>(process.env.TELEGRAM_BOT_TOKEN!);
const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
  default: "super-wizard",
});
bot.use(session());
bot.use(stage.middleware());

bot.launch();
