import { Events } from 'discord.js'

const handleCommand = async (interaction, client) => {
    const { commands } = client
    const { commandName } = interaction
    const command = commands.get(commandName)

    if (!command) return

    try {
        await command.execute(interaction, client)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'Noe gikk galt 😞', ephemeral: true })
    }
}

const handleSelectMenu = async (interaction, client) => {
    const { selectMenus } = client
    const { customId } = interaction
    const selectMenu = selectMenus.get(customId)

    if (!selectMenu) return

    try {
        await selectMenu.handle(interaction, client)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'Noe gikk galt 😞', ephemeral: true })
    }
}

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isCommand()) await handleCommand(interaction, client)
        if (interaction.isSelectMenu()) await handleSelectMenu(interaction, client)
    }
}