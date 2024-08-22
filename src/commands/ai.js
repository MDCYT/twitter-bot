import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord.js';
import { OpenAIUtils } from '../util/utils.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'ai',
		description: 'Reply with a AI response (BETA)',
		options: [
			{
				name: 'message',
				type: ApplicationCommandOptionType.String,
				description: 'The message to question the AI', 
				required: true,
			},
		],
		contexts: [InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM],
		integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	},
	cooldown: 60,
	async execute(interaction) {
		const message = interaction.options.getString('message');

		await interaction.deferReply();

		let response = await OpenAIUtils.chat(message);

		response = response.replaceAll(/#(?<temp1>\w+)/g, '[#$1](https://twitter.com/search?q=%23$1&src=hashtag_click)').replaceAll(/@(?<temp1>\w+)/g, '[@$1](https://twitter.com/$1)');

		interaction.editReply(response);
	},
};
