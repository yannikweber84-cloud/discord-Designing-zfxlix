const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot läuft");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server läuft auf Port " + PORT);
});
require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

// =======================
// BOT DATEN
// =======================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1512037540025077790";
const STAFF_ROLE_ID = "1498756244377305139";

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =======================
// SLASH COMMAND
// =======================

const commands = [
    new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Erstellt das Ticket Panel')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log("✅ Slash Commands registriert.");

    } catch (error) {
        console.error(error);
    }
})();

// =======================
// READY
// =======================

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} ist online.`);
});

// =======================
// INTERACTIONS
// =======================

client.on(Events.InteractionCreate, async interaction => {

    // ====================================
    // /ticketpanel
    // ====================================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'ticketpanel') {

            const embed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setTitle('🎫 Allgemeiner Support')
                .setDescription(`
Do you have a problem, a question, or need help on the server ? Then youre in the right place !

Create a ticket and describe your issue as clearly and in as much detail as possible so we can assist you quickly and effectively.

━━━━━━━━━━━━━━━━━━

📌 **What we can help you with:**

• Server related questions
• Problems / Bugs
• Reporting players
• General assistance
• Other Stuff

━━━━━━━━━━━━━━━━━━

👥 **Applications & General Support**

Would you like to apply for a position or request general support?

Select the appropriate category below.

━━━━━━━━━━━━━━━━━━
                `)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: 'powered by FARM Support System'
                });

            const menu = new StringSelectMenuBuilder()
                .setCustomId('ticket_menu')
                .setPlaceholder('Wähle eine Kategorie aus um ein Ticket zu öffnen')
                .addOptions([
                    {
                        label: 'Discord Design',
                        description: 'You would like us to design your server ?',
                        emoji: '🛡',
                        value: 'Discord Design'
                    },
                    {
                        label: 'Staff Application',
                        description: 'Do you want to apply to join our staff?',
                        emoji: '👥',
                        value: 'Staff Application'
                    },
                    {
                        label: 'Support',
                        description: 'You need General Support ?',
                        emoji: '🏗',
                        value: 'Support'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    // ====================================
    // DROPDOWN MENÜ
    // ====================================

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'ticket_menu') {

            const selected = interaction.values[0];

            let ticketName = "";
            let ticketTitle = "";

     let categoryId = "";

if (selected === "Discord Design") {
    ticketName = `🎫Discord Design-${interaction.user.username}`;
    ticketTitle = "🛡 Discord Design ";
    categoryId = "1512038511447113738";
}

if (selected === "Staff Application") {
    ticketName = `🔒Staff Application-${interaction.user.username}`;
    ticketTitle = "👥Staff Application ";
    categoryId = "1512038406358827068";
}

if (selected === "Support") {
    ticketName = `💬support-${interaction.user.username}`;
    ticketTitle = "🏗 Support ";
    categoryId = "1512038299185975409";
}
            // Prüfen ob Ticket schon existiert

            const existing = interaction.guild.channels.cache.find(
                c => c.name === ticketName.toLowerCase()
            );

            if (existing) {
                return interaction.reply({
                    content: `❌ Du hast bereits ein Ticket offen: ${existing}`,
                    ephemeral: true
                });
            }

            // Ticket erstellen

       const channel = await interaction.guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        },
        {
            id: STAFF_ROLE_ID,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        }
    ]
});

            // =======================
            // BUTTONS
            // =======================

            const claimButton = new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('Ticket übernehmen')
                .setEmoji('📌')
                .setStyle(ButtonStyle.Primary);

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Ticket schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);

            const buttonRow = new ActionRowBuilder()
                .addComponents(claimButton, closeButton);

            // =======================
            // TICKET EMBED
            // =======================

            const ticketEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle(ticketTitle)
                .setDescription(`
Hello ${interaction.user} 👋

Your ticket has been successfully created.

📌 Please describe your concern as accurately as possible so that the team can help you quickly.
                `)
                .setFooter({
                    text: 'FARM Clan Ticket System'
                })
                .setTimestamp();

            await channel.send({
                content: `<@&${STAFF_ROLE_ID}>`,
                embeds: [ticketEmbed],
                components: [buttonRow]
            });

            await interaction.reply({
                content: `✅ Your ticket has been created: ${channel}`,
                ephemeral: true
            });
        }
    }

    // ====================================
    // BUTTONS
    // ====================================

    if (interaction.isButton()) {

        // ====================================
        // TICKET ÜBERNEHMEN
        // ====================================

        if (interaction.customId === 'claim_ticket') {

            // Prüfen ob Staff

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: '❌ Only team members can take over tickets.',
                    ephemeral: true
                });
            }

            // Neue Buttons

            const claimedButton = new ButtonBuilder()
                .setCustomId('claimed_ticket')
                .setLabel(`Übernommen von ${interaction.user.username}`)
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Ticket schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);

            const newRow = new ActionRowBuilder()
                .addComponents(claimedButton, closeButton);

            // Nachricht bearbeiten

            await interaction.message.edit({
                components: [newRow]
            });

            // Claim Nachricht

            const claimEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setDescription(`
📌 The Staff Member ${interaction.user} has claimed the Ticket.

He will take care of you shortly.
                `)
                .setTimestamp();

            await interaction.reply({
                embeds: [claimEmbed]
            });
        }

        // ====================================
        // TICKET SCHLIESSEN
        // ====================================

        if (interaction.customId === 'close_ticket') {

            await interaction.reply({
                content: '🔒 Ticket will be closed in 3 seconds...',
                ephemeral: false
            });

            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 3000);
        }
    }
});

client.login(TOKEN);
