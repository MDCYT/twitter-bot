import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { formatNumber } from '../util/utils.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'user',
		description: 'Get info about a Twitter user',
		options: [
			{
				name: 'user',
				type: ApplicationCommandOptionType.String,
				description: 'The user to get info about',
				required: true,
			},
		],
		contexts: [InteractionContextType.Guild, InteractionContextType.PrivateChannel],
		integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	},
	async execute(interaction) {
		await interaction.deferReply();

		const user = interaction.options.getString('user');

		// Make a regex for twitter username, examples: "x", "@x", "mdc_dev", "@mdc_dev"
		const regex = /^@?(?<temp1>\w{1,15})$/;
		const match = user.match(regex);
		if (!match) {
			return interaction.reply({
				content: 'Invalid Twitter username',
				ephemeral: true,
			});
		}

		const username = match[1];

		try {
			const res = await fetch(`https://api.mdcdev.me/v2/twitter/users/${username}`);
			const data = await res.json();

			const embed = new EmbedBuilder()
				.setTitle(`${data.fullName} (@${data.userName})${data.isVerified ? ' ☑️' : ''}`)
				.setDescription(data.description)
				.setThumbnail(data.profileImage)
				.setImage(data.profile)
				.setURL(`https://twitter.com/${data.userName}`)
				.setColor(0x00acee)
				.setFooter({
					text: data.id,
					iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
				})
				.setTimestamp(new Date(data.createdAtTimestamp))
				.addFields(
					{
						name: 'Followers',
						value: `${formatNumber(data.followersCount)} (${data.followersCount})`,
						inline: true,
					},
					{
						name: 'Followings',
						value: `${formatNumber(data.followingsCount)} (${data.followingsCount})`,
						inline: true,
					},
					{
						name: 'Tweets',
						value: `${formatNumber(data.statusesCount)} (${data.statusesCount})`,
						inline: true,
					},
					{
						name: 'Likes (Given)',
						value: `${formatNumber(data.likeCount)} (${data.likeCount})`,
						inline: true,
					},
				);

			if (data.location) {
				embed.addFields({
					name: 'Location',
					value: data.location,
					inline: true,
				});
			}

			const buttons = [
				new ButtonBuilder()
					.setLabel('Follow')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://twitter.com/intent/follow?screen_name=${data.userName}`)
					.setEmoji('♥️'),
				new ButtonBuilder()
					.setLabel('Tweet')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://twitter.com/intent/tweet?via=MDC_DEV&text=@${data.userName}`)
					.setEmoji('🐦'),
				new ButtonBuilder()
					.setLabel('Profile')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://twitter.com/${data.userName}`)
					.setEmoji('👤'),
				new ButtonBuilder()
					.setLabel('DM')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://twitter.com/messages/compose?recipient_id=${data.id}`)
					.setEmoji('📩'),
			];

			return interaction.editReply({
				embeds: [embed],
				components: [new ActionRowBuilder().addComponents(...buttons)],
			});
		} catch (error) {
			console.error(error);
			return interaction.editReply({
				content: 'Error, user not found, make sure you typed the username correctly.',
				ephemeral: true,
			});
		}
	},
};
