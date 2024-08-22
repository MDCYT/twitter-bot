import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';


/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'ping',
		description: 'Get the bot\'s latency',
		contexts: [InteractionContextType.Guild],
		integration_types: [ApplicationIntegrationType.GuildInstall],
	},
	async execute(interaction) {
		await interaction.deferReply();

		const embed = new EmbedBuilder()
			.setTitle('Pong...')
			.setColor(0x00acee)
			.setDescription(`My ping is __**${interaction.client.ws.ping} ms**__`)
			.setFooter({
				text: 'Twitter',
				iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
			});

		interaction.editReply({ embeds: [embed] });
	},
};
