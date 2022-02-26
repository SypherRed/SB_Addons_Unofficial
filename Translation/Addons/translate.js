const fs = require("fs");

const Discord = require("discord.js");
const yaml = require("js-yaml");
const supportbot = yaml.load(
  fs.readFileSync("./Configs/supportbot.yml", "utf8")
);
const config = yaml.load(
  fs.readFileSync("./Addons/Configs/translate.yml", "utf8")
);
const { Command } = require("../Structures/Addon");

const translate = require("@vitalets/google-translate-api"); // Require this dependency and load it in

module.exports.commands = [
  new Command({
    name: config.TranslateCommand, // Name of command
    description: config.TranslateCommandDesc, // Description of command
    usage: "/translate [en] [text]", // How to use the command
    options: [
      {
        type: "STRING",
        name: "language",
        description: "A 2 letter language code",
        required: true,
      },
      {
        type: "STRING",
        name: "text",
        description: "The text to translate",
        required: true,
      }, // The input text for the translation
    ],
    permissions: ["SEND_MESSAGES"], // The permission the user/role at least requires
    async run(interaction) {
      const { getChannel } = interaction.client;
      let lang = interaction.options.getString("language"); // Grab choice of language code by user
      let url = "https://www.science.co.il/language/Codes.php"; // URL to all available language codes
      let text = await interaction.options.getString("text"); // Grab the text to translate by the user
      let translatelog = await getChannel(
        config.TranslateLogChannel,
        interaction.guild
      ); // Grab the set logging channel for translations

      // Return message if user has provided a language code less than [2] or more than [2] letters

      const result = await translate(text, { to: lang }).catch(async (err) => {
        if (err && err.code == 400) {
          await interaction.reply({
            embeds: [
              new Discord.MessageEmbed()
                .setColor(supportbot.WarningColour)
                .setTitle("Valid Language Codes")
                .setURL(url)
                .setDescription(
                  "**Click the title to see which 2 letter language codes are valid.**"
                ),
            ],
            ephemeral: true,
          });
        }
      });
      if (!result) return;
      // Embed containing with language code and translated text
      let trans = new Discord.MessageEmbed()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor(supportbot.SuccessColour)
        .setDescription(`**Translated to ${lang}**\n${result.text}`)
        .setTimestamp();

      // Edit
      await interaction.reply({ embeds: [trans] });

      // Send embed [trans] to logging channel and catch errors to console
      await translatelog.send({ embeds: [trans] });
    },
  }),
];

/**
 * @INFO
 * Translate command addon by Sypher#3415 | 321332200668790786
 * @INFO
 * Created for v7.4.2
 * @INFO
 * Solely created for SupportBot | https://github.com/Emerald-Services/SupportBot/
 **/
