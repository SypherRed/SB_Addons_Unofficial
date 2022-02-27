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


      // Return message if user has provided an invalid language code
      const result = await translate(text, { to: lang }).catch(async (err) => {
        if (err && err.code == 400) {
          await interaction.reply({
            embeds: [
              new Discord.MessageEmbed()
                .setColor(supportbot.WarningColour)
                .setTitle("Valid Language Codes")
                .setURL(url)
                .setDescription(
                  "Click the title to see which 2 letter language codes are valid."
                ),
            ],
            ephemeral: true,
          });
        }
      });
      if (!result) return;

      // Embed containing language code, original text and translated text
      let transembed = new Discord.MessageEmbed()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor(supportbot.SuccessColour)
        .setDescription(`**Translation to ${lang}**`)
        .addFields(
          { name: "Original text", value: text },
          { name: "Translated text", value: result.text },
        )
        .setFooter({ text: `Author: ${interaction.user.id}` })
        .setTimestamp();

      // Send embed [transembed] with translated message to channel
      await interaction.reply({ embeds: [transembed] });

      // Send embed [transembed] to logging channel
      await translatelog.send({ embeds: [transembed] });
    },
    
  }),
];

/**
 * @INFO
 * Translate command addon by Sypher#3415 | 321332200668790786
 * @INFO
 * Created for v7.4.2 and higher
 * @INFO
 * Solely created for SupportBot | https://github.com/Emerald-Services/SupportBot/
 **/