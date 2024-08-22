import { Events } from 'discord.js';

const cooldowns = new Map();

/**
 * @param {Map<string, import('../commands/index.js').Command>} commands
 * @param {import('../events/index.js').Event[]} events
 * @param {import('discord.js').Client} client
 */
export function registerEvents(commands, events, client) {
	// Create an event to handle command interactions
	/** @type {import('../events/index.js').Event<Events.InteractionCreate>} */
	const interactionCreateEvent = {
		name: Events.InteractionCreate,
		async execute(interaction) {
			if (interaction.isCommand()) {
				const command = commands.get(interaction.commandName);

				if (!command) {
					throw new Error(`Command '${interaction.commandName}' not found.`);
				}

				if (command.cooldown) {
					if (!cooldowns.has(`${interaction.commandName}-${interaction.guildId}-${interaction.user.id}`)) {
						cooldowns.set(`${interaction.commandName}-${interaction.guildId}-${interaction.user.id}`, Date.now() - command.cooldown * 1_000);
					}

					const now = Date.now();
					const timestamp = cooldowns.get(`${interaction.commandName}-${interaction.guildId}-${interaction.user.id}`);
					const cooldownAmount = command.cooldown * 1_000;

					if (timestamp + cooldownAmount > now) {
						const timeLeft = (timestamp + cooldownAmount) - now;
						await interaction.reply({
							content: `Please wait ${Math.floor(timeLeft / 1_000)} more second(s) before reusing the \`${interaction.commandName}\` command.`,
							ephemeral: true,
						});

						return;
					}

					cooldowns.set(`${interaction.commandName}-${interaction.guildId}-${interaction.user.id}`, now);
				}

				await command.execute(interaction);
			}
		},
	};

	for (const event of [...events, interactionCreateEvent]) {
		client[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
	}
}
