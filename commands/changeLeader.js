const {SlashCommandBuilder} = require("@discordjs/builders");
const {PermissionFlagsBits} = require("discord-api-types/v10");
const sqlite3 = require("sqlite3").verbose();
const {updateMessages} = require("../components/updateMessages");
const {updateLeaders} = require("../components/updateLeaders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("change-leader")
		.setDescription("Changes the leader of a role")
		.addRoleOption((option) => option.setName("role").setDescription("A role of which leader will be changed.").setRequired(true))
		.addStringOption((option) => option.setName("leader").setDescription("(Optional) Leader of the state/organisation").setRequired(false)),
	execute: async ({client, interaction}) => {
		roleId = interaction.options.getRole("role").id;
		if (interaction.member.roles.cache.has(roleId) || interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			guildId = interaction.options.getRole("role").guild.id;
			leader = interaction.options.getString("leader");

			const db = new sqlite3.Database("./data.db", sqlite3.OPEN_READWRITE, (err) => {
				if (err) return console.errror(err.message);
			});

			db.all(`SELECT roleId FROM watchedRoles WHERE roleId LIKE ?`, [roleId], async (err, rows) => {
				result = rows.map((row) => row.roleId);

				// If the role isn't on the watch list
				if (result.length == 0) {
					await interaction.reply({
						content: `<@&${roleId}> isn't on the Role Member Counter watch list!`,
						ephemeral: true,
					});
				} else {
					db.run(`UPDATE watchedRoles SET leader = ? WHERE roleId = ?`, [leader, roleId], async (err) => {
						if (err) {
							return console.error(err.message);
						}
						await interaction.reply({
							content: `<@&${roleId}>'s leader has been updated to ${leader}`,
							ephemeral: false,
						});

						interactionGuildId = interaction.guild.id;
						updateMessages({client, interactionGuildId});
						updateLeaders({client, interactionGuildId});
					});
				}
			});

			db.close((err) => {
				if (err) return console.error(err.message);
			});
		}
		// if user doesn't have the role nor perms
		else {
			await interaction.reply({
				content: `You are not part of <@&${roleId}> and thus, can't modify its leader.`,
				ephemeral: true,
			});
		}
	},
};
