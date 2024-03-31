const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("test"),
	execute: async ({ client, interaction }) => {
        await interaction.reply({
          content:"działa",
          ephemeral: true,
        })
	},
}