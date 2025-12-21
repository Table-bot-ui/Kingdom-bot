import translate from "translate-google";
import { EmbedBuilder } from "discord.js";

const googleLangs = {
  "afrikaans":"af","albanian":"sq","amharic":"am","arabic":"ar",
  "armenian":"hy","azerbaijani":"az","basque":"eu","belarusian":"be",
  "bengali":"bn","bosnian":"bs","bulgarian":"bg","catalan":"ca",
  "cebuano":"ceb","chichewa":"ny","chinese":"zh-cn","chinese (simplified)":"zh-cn",
  "chinese (traditional)":"zh-tw","corsican":"co","croatian":"hr",
  "czech":"cs","danish":"da","dutch":"nl","english":"en","esperanto":"eo",
  "estonian":"et","filipino":"tl","finnish":"fi","french":"fr","frisian":"fy",
  "galician":"gl","georgian":"ka","german":"de","greek":"el","gujarati":"gu",
  "haitian creole":"ht","hausa":"ha","hawaiian":"haw","hebrew":"iw","hindi":"hi",
  "hmong":"hmn","hungarian":"hu","icelandic":"is","igbo":"ig","indonesian":"id",
  "irish":"ga","italian":"it","japanese":"ja","javanese":"jw","kannada":"kn",
  "kazakh":"kk","khmer":"km","korean":"ko","kurdish":"ku","kyrgyz":"ky",
  "lao":"lo","latin":"la","latvian":"lv","lithuanian":"lt","luxembourgish":"lb",
  "macedonian":"mk","malagasy":"mg","malay":"ms","malayalam":"ml","maltese":"mt",
  "maori":"mi","marathi":"mr","mongolian":"mn","myanmar":"my","nepali":"ne",
  "norwegian":"no","odia":"or","pashto":"ps","persian":"fa","polish":"pl",
  "portuguese":"pt","punjabi":"pa","romanian":"ro","russian":"ru","samoan":"sm",
  "scots gaelic":"gd","serbian":"sr","sesotho":"st","shona":"sn","sindhi":"sd",
  "sinhala":"si","slovak":"sk","slovenian":"sl","somali":"so","spanish":"es",
  "sundanese":"su","swahili":"sw","swedish":"sv","tajik":"tg","tamil":"ta",
  "telugu":"te","thai":"th","turkish":"tr","ukrainian":"uk","urdu":"ur",
  "uzbek":"uz","vietnamese":"vi","welsh":"cy","xhosa":"xh","yiddish":"yi",
  "yoruba":"yo","zulu":"zu"
};

export default {
  name: "translate",

  async execute(message, args) {

    if (args.length < 2)
      return message.reply("Usage: `!translate <language> <text>`");

    // Remove the "to" keyword
    if (args[0].toLowerCase() === "to") args.shift();

    // Extract language
    let langInput = args.shift().toLowerCase();

    // Convert language name → code
    let lang = googleLangs[langInput] || langInput;

    const text = args.join(" ");

    try {
      const result = await translate(text, { to: lang });

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🌍 Translation Result")
        .addFields(
          { name: "Translated To", value: lang.toUpperCase(), inline: true },
          { name: "Original Text", value: text },
          { name: "Translated Text", value: result }
        )
        .setFooter({ text: "Powered by Google Translate" });

      message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("Invalid language or translation error.");
    }
  }
};