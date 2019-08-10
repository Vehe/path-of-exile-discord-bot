const Discord = require('discord.js');

module.exports = {
    name: 'alerts',
    usage: '.alerts',
    description: 'Se utiliza para establecer alertas sobre un objeto.',
    execute(message, args) 
    {
        if (args.length < 1) return help();

        // Seleccionamos las alertas del cliente actual.
        const alertsMap = message.client.alerts;
        const serverAlerts = alertsMap.get(message.guild.id);

        if(args[0] == 'status')
        {
            // Base del mensaje.
            let alertBuildMessage = {
                color: 0x00aedb,
                author: {
                    name: "Alertas Activadas:",
                    icon_url: 'https://boosting.pro/wp-content/uploads/2013/02/poe-exalted-orb3-265x265_c.png'
                },
                thumbnail: {
                    "url": "https://boosting.pro/wp-content/uploads/2013/02/poe-exalted-orb3-265x265_c.png"
                }
            }

            /**
             * Muestra al usuario las aletas que tiene activas en este momento.
             */
            serverAlerts ? alertBuildMessage.fields = serverAlerts : alertBuildMessage.description = 'No tienes alertas activas!';
            return message.channel.send({"embed":alertBuildMessage});
        }

        /**
         * Mensaje de ayuda para las alertas.
         */
        function help() 
        {
            const configUsage = new Discord.RichEmbed()
                .setColor('#bf0a30')
                .setAuthor('Path Of Exile BOT', 'https://www.pathofexile.com/image/war/logo.png')
                .setThumbnail('https://www.pathofexile.com/image/war/logo.png')
                .setFooter('Cuando acabes de configurarme podrás comenzar.');

            message.channel.send(configUsage);
        }

    },

};