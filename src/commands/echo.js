import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord.js';


/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'echo',
		description: 'Replies with your input!',
		options: [
			{
				name: 'input',
				type: ApplicationCommandOptionType.String,
				description: 'The input to echo back',
				required: true,
			},
			{
				name: 'ephemeral',
				type: ApplicationCommandOptionType.Boolean,
				description: 'Whether to send the response as an ephemeral message',
				required: false,
			},
		],
		contexts: [InteractionContextType.Guild],
		integration_types: [ApplicationIntegrationType.GuildInstall],
	},
	async execute(interaction) {
		const input = interaction.options.getString('input');
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

		interaction.reply({
			content: input,
			ephemeral,
		});
	},
};
