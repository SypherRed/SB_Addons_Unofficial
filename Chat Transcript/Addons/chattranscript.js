const fs = require("fs");

const Discord = require("discord.js");
const { Command } = require("../Structures/Addon");
const yaml = require("js-yaml");
const { createTranscript } = require("discord-html-transcripts");

const supportbot = yaml.load( fs.readFileSync("./Configs/supportbot.yml", "utf8") );
const config = yaml.load(fs.readFileSync('./Addons/Configs/chat-transcript.yml', 'utf8'));

module.exports.commands = [

    new Command({

        name: config.ChatTranscriptCommandName,
        description: config.ChatTranscriptCommandDesc,
        options: [
            {
                name: "channel",
                description: "The channel for which you want to have a transcript for. Mention it or provide Channel-ID.",
                type: "CHANNEL",
                required: true
            }
        ],
        permissions: ["MANAGE_MESSAGES"],

        async run(interaction) {

            const { getChannel } = interaction.client;
            const channel = interaction.options.getChannel("channel");
            const logchannel = await getChannel(config.ChatTranscriptLogChannel, interaction.guild);
            const channelName = channel.name;

            if (!channel) return interaction.reply({content: `A channel must be either mentioned or a Channel-ID provided.` , ephemeral: true});
            
            const logmsg = new Discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTitle (`Chat Transcript`)
                .setColor (supportbot.SuccessColour)
                .setDescription (`Saved chat transcript of ${channel}`)
            
            const attachment = await createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                fileName: `${channelName}.html`,
                });

            const embed = new Discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTitle ("Transcript saved")
                .setColor (supportbot.EmbedColour)
                .setDescription (`Saved a transcript of ${channel} to ${logchannel}.`)
                .setTimestamp()
            
            await logchannel.send({ embeds: [logmsg], files: [attachment]} );

            interaction.reply({ embeds: [embed], ephemeral: true })
                .catch((err) => console.log(err));

        },
    }),
];

/**
 * @INFO
 * ChatTranscript command addon by Sypher#3415 | 321332200668790786
 * @INFO
 * Created for v7.4.2 and higher
 * @INFO
 * Solely created for SupportBot | https://github.com/Emerald-Services/SupportBot/
 **/