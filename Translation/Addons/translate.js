const fs = require("fs");

const Discord = require("discord.js");
const yaml = require("js-yaml");
const supportbot = yaml.load( fs.readFileSync("./Configs/supportbot.yml", "utf8") );
const transconfig = yaml.load (fs.readFileSync('./Addons/settings/transconfig.yml', 'utf8') );
const { Command } = require("../Structures/Addon");


module.exports.commands = new Command({

  name: transconfig.TranslateCommand, // Name of command
  description: transconfig.TranslateDesc, // Description of command
  usage: "/translate [en] [text]", // How to use the command
  options: [
    {"StringChoices": { name: "language", description: "A 2 letter language code", required: true, choices: 
      [
        [
          "English", "en"
        ],
        [
          "French", "fr"
        ],
        [
          "German", "de"
        ],
        [
          "Italian", "it"
        ]
      ]
    }},
    {"String": { name: "text", description: "The text to translate", required: true }} // The input text for the translation

  ],
  permissions: ["SEND_MESSAGES"], // The permission the user/role at least requires

  async run(interaction) {

    // Check if StaffOnly is [true] in supportbot.yml
    if (supportbot.StaffOnly) {
      let SupportStaff = await getRole(supportbot.Staff, interaction.guild);
      let Admin = await getRole(supportbot.Admin, interaction.guild);
      if (!SupportStaff || !Admin)
        return interaction.reply(
          "Some roles seem to be missing!\nPlease check for errors when starting the bot."
        );
      const NoPerms = new Discord.MessageEmbed()
        .setTitle("Invalid Permissions!")
        .setDescription(
          `${supportbot.IncorrectPerms}\n\nRole Required: \`${supportbot.Staff}\` or \`${supportbot.Admin}\``
        )
        .setColor(supportbot.WarningColour);

      if (
        !interaction.member.roles.cache.has(SupportStaff.id) &&
        !interaction.member.roles.cache.has(Admin.id)
      )
        return interaction.reply({ embeds: [NoPerms] });
    };

    const translate = require("@vitalets/google-translate-api"); // Require this dependency and load it in

    let args = interaction.options.getString("language"); // Grab choice of language code by user
    let url = "https://www.science.co.il/language/Codes.php" // URL to all available language codes
    let text = await interaction.options.getString("text");
    let translatelog = await getChannel(transconfig.TranslateLogChannel, interaction.guild); // Grab the set logging channel for translations

    const result = await translate(text, { to: language });

    // Return message if user has not provided any language code
    if (!args) return interaction.reply(new Discord.MessageEmbed()
      .setColor(supportbot.WarningColour)
      .setTitle('Language Codes')
      .setURL(url)
      .setDescription('**Click the title to see which 2 letter language codes are available.**')
    ).then(interaction => {
      interaction.timeout()
      interaction.delete({ timeout: 3500 })
    });

    // Return message if user has provided a language code less than [2] or more than [2] letters
    if (args.length !== 2) return interaction.reply(new Discord.MessageEmbed()
      .setColor(supportbot.WarningColour)
      .setTitle('Valid Language Codes')
      .setURL(url)
      .setDescription('**Click the title to see which 2 letter language codes are valid.**')
    ).then(interaction => {
      interaction.timeout()
      interaction.delete({ timeout: 3500 })
    });

    // Return message if user has not provided any text to translate
    if (!text) return interaction.reply(new Discord.MessageEmbed()
      .setColor(supportbot.WarningColour)
      .setTitle('Missing Text')
      .setDescription('**Missing a text to translate.**')
    ).then(interaction => {
      interaction.timeout()
      interaction.delete({ timeout: 3500 })
    });

    // Embed containing with language code and translated text
    let trans = new Discord.MessageEmbed()
      .setAuthor({ name: interaction.author.tag, iconURL: interaction.author.displayAvatarURL({ dynamic: true }) })
      .setColor(supportbot.SuccessColour)
      .setDescription(`**Translated to ${args}**\n${result.text}`)
      .setTimestamp()

    // Edit 
    await interaction?.reply({content: `Translating your message... `, ephermal: true}).catch(() => {});

    // Send embed [trans] or send error if failed to do so
    await channel.send({embeds: [trans]}).catch(() => {
      channel.send({content: 'An error occured while trying to send the message!'}).catch(() => {});
    });

    // Send embed [trans] to logging channel and catch errors to console
    await translatelog.channel.send({embeds: [trans]}).catch((err).console.error('An error occured while trying to send the transcript in the log channel! ', err)) 

  }, catch (e) {
    console.log('Faced an issue while translating', e)
  }

});

/** 
* @INFO 
* Translate command addon by Sypher#3415 | 321332200668790786
* @INFO
* Created for v7.4.2
* @INFO
* Solely created for SupportBot | https://github.com/Emerald-Services/SupportBot/
**/
