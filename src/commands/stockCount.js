import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getStockCountChannel } from '../services/stockCounter.js';
import models from '../models/index.js'

const { User, Setting } = models;

const handleMeSubcommand = async (interaction, stockCountChannel) => {
    const user = await User.findOne({ where: { channelId: stockCountChannel.id, userId: interaction.user.id }})

    if (user === null || user.stocks === 0) {
        await interaction.reply({ content: `Jeg har ingen aksjer oppført på deg`, ephemeral: true })
        return
    }

    const totalAvailableStocks = await Setting.getSetting('totalAvailableStocks', 420625659)
    const percentageOfAvailable = (user.stocks / totalAvailableStocks * 100).toFixed(2)

    await interaction.reply({
        content: `Jeg har oppført at du har **${user.stocks}** aksjer, du eier **${percentageOfAvailable}%** av RECSI.`,
        ephemeral: true
    })
}

const handleSummarySubcommand = async (interaction, stockCountChannel) => {
    if (interaction.channel.id !== stockCountChannel.id) {
        await interaction.reply({ content: '`/stock-count summary` kan kun brukes i ' + stockCountChannel.toString(), ephemeral: true })
        return
    }

    const totalAvailableStocks = await Setting.getSetting('totalAvailableStocks', 420625659)
    const totalUserStocks = await User.sum('stocks', { where: { channelId: stockCountChannel.id }})
    const totalUsers = await User.count({ where: { channelId: stockCountChannel.id }})
    const percentageOfAvailable = (totalUserStocks / totalAvailableStocks * 100).toFixed(2)

    const embed = new EmbedBuilder()
        .setTitle('Oppsummering')
        .setDescription(`Fordelt på **${totalUsers}** deltakere har vi totalt **${totalUserStocks}** aksjer, sammen eier vi **${percentageOfAvailable}%** av RECSI.\n\n**[Se hele listen i Google Sheets](https://docs.google.com/spreadsheets/d/1RCQfWblswsaAXc7THhuPnqS2OX7v6cVUW2fNI4DKaC0)**`)
        .setFooter({ text: 'Jeg teller kun med det siste tallet du har skrevet i kanalen 🤖'})

    await interaction.reply({ embeds: [embed]})
}

export default {
    data: new SlashCommandBuilder()
        .setName('stock-count')
        .setDescription('Antall aksjer')
        .addSubcommand(subcommand => subcommand
            .setName('summary')
            .setDescription('Gir en oppsummering på antall aksjer')
        )
        .addSubcommand(subcommand => subcommand
            .setName('me')
            .setDescription('Hvor mange aksjer tror jeg at du har?')
        ),
    async execute(interaction, client) {
        const stockCountChannel = await getStockCountChannel()
        if (! stockCountChannel) {
            await interaction.reply({ content: 'Boten er ikke konfigurert.', ephemeral: true })
            return
        }

        if (interaction.options.getSubcommand() === 'me') await handleMeSubcommand(interaction, stockCountChannel)
        if (interaction.options.getSubcommand() === 'summary') await handleSummarySubcommand(interaction, stockCountChannel)
    }
}