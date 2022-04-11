const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const yaml = require("js-yaml");

const { Command } = require("../Structures/Addon");

const config = yaml.load(
  fs.readFileSync("./Addons/Configs/MCUser.yml", "utf8")
);
const supportbot = yaml.load(
  fs.readFileSync("./Configs/supportbot.yml", "utf8")
);

module.exports.commands = [
  new Command({
    name: config.MCUserCommand,
    description: config.MCUserDesc,
    options: [
      {
        name: "username",
        description: "Minecraft Username to search for.",
        type: "STRING",
        required: true,
      },
    ],
    permissions: ["SEND_MESSAGES"],
    async run(interaction) {
      const username = interaction.options.getString("username");

      axios
        .get(`https://some-random-api.ml/mc/?username=${username}`) 
        .then((Response) => {

          const { data } = Response;
          const embed = new Discord.MessageEmbed()
            .setColor(supportbot.EmbedColour)
            .setTitle(`${username}'s information`)
            .addFields(
              { name: "Username(s)", value: data.name_history.map((a) => `${a.name} (${a.changedToAt})`).join(", "), inline: false },
              { name: "UUID", value: data.uuid, inline: false},
            )
            .setThumbnail("https://mc-heads.net/head/" + username + "/.png")
            .setImage("https://mc-heads.net/body/" + username + "/.png")

          interaction.reply({ embeds: [embed] });

        })
        .catch(() => interaction.reply({ content: `Please provide a valid username!`, ephemeral: true }) );
    },
  }),
];

/**
 * @INFO
 * MC UserInfo command addon by Sypher#3415 | 321332200668790786
 * @INFO
 * Created for v7.4.2 and higher
 * @INFO
 * Solely created for SupportBot | https://github.com/Emerald-Services/SupportBot/
 **/