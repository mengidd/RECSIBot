import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import models from '../models/index.js'

const { User, BannedUser } = models;

const handleResetSubcommand = async (interaction) => {
    await User.destroy({ where: { userId: interaction.options.getUser('target').id }})
}

const handleBanSubcommand = async (interaction) => {
    const user = interaction.options.getUser('target')

    await User.destroy({ where: { userId: user.id }})
    await BannedUser.findOrCreate({ where: { userId: user.id }})

    await interaction.reply({ content: `${user} er bannet fra opptellingen`, ephemeral: true })
}

const handleUnbanSubcommand = async (interaction) => {
    const user = interaction.options.getUser('target')
    const deletedItems = await BannedUser.destroy({ where: { userId: user.id }})

    if (deletedItems) {
        await interaction.reply({ content: `Ban er fjernet fra ${user}`, ephemeral: true })
    } else {
        await interaction.reply({ content: `Denne brukeren er ikke bannet`, ephemeral: true })
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('stock-count-moderate')
        .setDescription('Kan fjerne eller banne brukere fra å delta opptellingen')
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Nullstill en brukers tall')
            .addUserOption(option => option.setName('target').setDescription('Bruker'))
        )
        .addSubcommand(subcommand => subcommand
            .setName('ban')
            .setDescription('Nullstill en brukers tall og ignorer fremtidige tall fra denne brukeren')
            .addUserOption(option => option.setName('target').setDescription('Bruker'))
        )
        .addSubcommand(subcommand => subcommand
            .setName('unban')
            .setDescription('Fjern ban')
            .addUserOption(option => option.setName('target').setDescription('Bruker'))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (interaction.options.getSubcommand() === 'reset') await handleResetSubcommand(interaction)
        if (interaction.options.getSubcommand() === 'ban') await handleBanSubcommand(interaction)
        if (interaction.options.getSubcommand() === 'unban') await handleUnbanSubcommand(interaction)
    }
}