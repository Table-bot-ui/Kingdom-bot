import fs from "fs";
import path from "path";

export default {
  name: "reload",

  async execute(message, args, client) {
    // Owner check
    if (message.author.id !== process.env.BOT_OWNER_ID) return;

    const commandName = args[0];
    if (!commandName) {
      const msg = await message.reply("You must specify a command.");
      setTimeout(() => msg.delete().catch(() => {}), 10000);
      return message.delete().catch(() => {});
    }

    const filePath = path.resolve(`./commands/${commandName}.js`);

    if (!fs.existsSync(filePath)) {
      const msg = await message.reply("Command not found.");
      setTimeout(() => msg.delete().catch(() => {}), 10000);
      return message.delete().catch(() => {});
    }

    // Import fresh
    const newModule = await import(`${filePath}?update=${Date.now()}`);

    client.commands.set(commandName, newModule.default);

    const reply = await message.reply(`Reloaded **${commandName}**`);
    setTimeout(() => {
      reply.delete().catch(() => {});
      message.delete().catch(() => {});
    }, 10000);
  }
};