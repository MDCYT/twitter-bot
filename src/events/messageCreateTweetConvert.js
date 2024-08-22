import { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { formatNumber } from '../util/utils.js';

/** @type {import('./index.js').Event<Events.MessageCreate>} */
export default {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;
		console.log(message.content);

		const tweetRegex = /https?:\/\/(?:x|twitter)\.com\/\w+\/status\/(?<tweet>\d+)/i;
		const userRegex = /https?:\/\/(?:x|twitter)\.com\/(?<user>\w{1,15})/i;

		// Check if the message contains a tweet links, the message only contains one link, if there are more than one link, the bot will not reply, the message can contain text, like: "Check this tweet: https://twitter.com/user/status/123456789"
		let match = message.content.match(tweetRegex);
		if (match) {
			// Extract the user and tweet
			const tweetID = match.groups.tweet;

			try {
				// Fetch the tweet
				const tweetRes = await fetch(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}`);
				if (tweetRes.status !== 200) return;
				const tweetData = await tweetRes.json();

				// Create the embed
				const embed1 = new EmbedBuilder()
					.setColor('#00acee')
					.setTitle(
						`${tweetData.tweetBy.fullName} (@${tweetData.tweetBy.userName})${tweetData.tweetBy.isVerified ? ' ☑️' : ''}`,
					)
					.setDescription(tweetData.fullText)
					.setTimestamp(new Date(tweetData.createdAtTimestamp))
					.setFooter({
						text: tweetData.id,
						iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
					})
					.addFields(
						{ name: 'Likes', value: `${formatNumber(tweetData.likeCount)} (${tweetData.likeCount})`, inline: true },
						{ name: 'Quotes', value: `${formatNumber(tweetData.quoteCount)} (${tweetData.quoteCount})`, inline: true },
						{
							name: 'Retweets',
							value: `${formatNumber(tweetData.retweetCount)} (${tweetData.retweetCount})`,
							inline: true,
						},
						{ name: 'Views', value: `${formatNumber(tweetData.viewCount)} (${tweetData.viewCount})`, inline: true },
					)
					.setImage(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}/media/1/preview`)
					.setURL(`https://twitter.com/${tweetData.tweetBy.userName}/status/${tweetID}`);

				const embed2 = new EmbedBuilder()
					.setURL(`https://twitter.com/${tweetData.tweetBy.userName}/status/${tweetID}`)
					.setTitle(
						`${tweetData.tweetBy.fullName} (@${tweetData.tweetBy.userName})${tweetData.tweetBy.isVerified ? ' ☑️' : ''}`,
					)
					.setImage(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}/media/2/preview`);

				const embed3 = new EmbedBuilder()
					.setURL(`https://twitter.com/${tweetData.tweetBy.userName}/status/${tweetID}`)
					.setTitle(
						`${tweetData.tweetBy.fullName} (@${tweetData.tweetBy.userName})${tweetData.tweetBy.isVerified ? ' ☑️' : ''}`,
					)
					.setImage(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}/media/3/preview`);

				const embed4 = new EmbedBuilder()
					.setURL(`https://twitter.com/${tweetData.tweetBy.userName}/status/${tweetID}`)
					.setTitle(
						`${tweetData.tweetBy.fullName} (@${tweetData.tweetBy.userName})${tweetData.tweetBy.isVerified ? ' ☑️' : ''}`,
					)
					.setImage(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}/media/4/preview`);

				const actionRow = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Like')
						.setURL(`https://twitter.com/intent/like?tweet_id=${tweetID}`)
						.setEmoji('♥️'),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Retweet')
						.setURL(`https://twitter.com/intent/retweet?tweet_id=${tweetID}`)
						.setEmoji('🔁'),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Quote')
						.setURL(
							`https://twitter.com/intent/tweet?url=https://twitter.com/${tweetData.tweetBy.userName}/status/${tweetID}&text=Quote&via=MDC_DEV`,
						)
						.setEmoji('🔖'),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('Comment')
						.setURL(`https://twitter.com/intent/tweet?in_reply_to=${tweetID}&via=MDC_DEV`)
						.setEmoji('✉️'),
				);

				// Reply with the tweet
				await message.reply({ embeds: [embed1, embed2, embed3, embed4], components: [actionRow] });

				try {
					const mediaRes = await fetch(`https://api.mdcdev.me/v2/twitter/tweets/${tweetID}/media`);
					if (mediaRes.status !== 200) return;
					const mediaData = await mediaRes.json();

					for (const media of mediaData.media) {
						if (media.type === 'video') {
							const videoURL = media.url;
							await message.reply(`[Video URL](${videoURL})`);
						}
					}
				} catch (error) {
					console.error(error);
				}
			} catch (error) {
				console.error(error);
			}

			return;
		}

		// Check if the message contains a user link
		match = message.content.match(userRegex);
		if (match) {
			// Extract the user
			const userName = match.groups.user;

			try {
				// Fetch the user
				const userRes = await fetch(`https://api.mdcdev.me/v2/twitter/users/${userName}`);
				if (userRes.status !== 200) return;
				const userData = await userRes.json();

				// Create the embed
				const embed = new EmbedBuilder()
					.setTitle(`${userData.fullName} (@${userData.userName})${userData.isVerified ? ' ☑️' : ''}`)
					.setDescription(userData.description)
					.setThumbnail(userData.profileImage)
					.setImage(userData.profile)
					.setURL(`https://twitter.com/${userData.userName}`)
					.setColor(0x00acee)
					.setFooter({
						text: userData.id,
						iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
					})
					.setTimestamp(new Date(userData.createdAtTimestamp))
					.addFields(
						{
							name: 'Followers',
							value: `${formatNumber(userData.followersCount)} (${userData.followersCount})`,
							inline: true,
						},
						{
							name: 'Followings',
							value: `${formatNumber(userData.followingsCount)} (${userData.followingsCount})`,
							inline: true,
						},
						{
							name: 'Tweets',
							value: `${formatNumber(userData.statusesCount)} (${userData.statusesCount})`,
							inline: true,
						},
						{
							name: 'Likes (Given)',
							value: `${formatNumber(userData.likeCount)} (${userData.likeCount})`,
							inline: true,
						},
					);

				if (userData.location) {
					embed.addFields({
						name: 'Location',
						value: userData.location,
						inline: true,
					});
				}

				const buttons = [
					new ButtonBuilder()
						.setLabel('Follow')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://twitter.com/intent/follow?screen_name=${userData.userName}`)
						.setEmoji('♥️'),
					new ButtonBuilder()
						.setLabel('Tweet')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://twitter.com/intent/tweet?via=MDC_DEV&text=@${userData.userName}`)
						.setEmoji('🐦'),
					new ButtonBuilder()
						.setLabel('Profile')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://twitter.com/${userData.userName}`)
						.setEmoji('👤'),
					new ButtonBuilder()
						.setLabel('DM')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://twitter.com/messages/compose?recipient_id=${userData.id}`)
						.setEmoji('📩'),
				];

				// Reply with the user
				await message.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(...buttons)] });
			} catch (error) {
				console.error(error);
			}
		}
	},
};
