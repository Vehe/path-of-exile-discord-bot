const Discord = require('discord.js');

module.exports = {
	name: 'config',
	usage: '.config',
    description: 'Se utiliza para la configuración inicial del bot.',
    execute(message, args) 
    {
        const images = {
            poe_logo: 'https://www.pathofexile.com/image/war/logo.png',
            error_gif: 'https://media.giphy.com/media/GpsY8yDrq7tjG/giphy.gif',
            error_ico: 'https://png.pngtree.com/svg/20161110/377e629a9e.png',
            success_gif: 'https://media.giphy.com/media/IzfJSTepKi5vW/giphy.gif',
            success_ico: 'https://png.pngtree.com/svg/20170510/418329c59c.png',
            actual_ico: 'https://icon-library.net/images/config-icon/config-icon-8.jpg'
        };

        // Si no tiene dos argumentos saldremos del comando.
        if (args.length < 1) return help();

        const posibleLeagues = ['legion', 'hcl', 'standard', 'hardcore']

        if (args[0] == 'league') 
        {
            const leaguePosition = posibleLeagues.indexOf(args[1].toLowerCase());

            if (leaguePosition > -1) 
            {
                message.client.league = posibleLeagues[leaguePosition]
                return message.channel.send({
                    "embed": {
                            color: 0x32ff6a,
                            author: {
                                name: "Configuración establecida con exito!",
                                icon_url: images.success_ico
                            },
                            "image": {
                                "url": images.success_gif,
                            }
                        }
                    });
            } 
            else 
            {
                return message.channel.send({
                    "embed": {
                            color: 0xcc2a36,
                            author: {
                                name: "Oh, Oh! No ha sido posible actualizar la configuración!",
                                icon_url: images.error_ico
                            },
                            "image": {
                                "url": images.error_gif,
                            }
                        }
                    });
            }

        } 
        else if (args[0] == 'refresh') 
        {
            const refreshMins = args[1];

            if (!isNaN(refreshMins))
            {
                message.client.refresh = refreshMins;
                return message.channel.send({
                    "embed": {
                            color: 0x32ff6a,
                            author: {
                                name: "Configuración establecida con exito!",
                                icon_url: images.success_ico
                            },
                            "image": {
                                "url": images.success_gif,
                            }
                        }
                    });
            } 
            else
            {
                return message.channel.send({
                    "embed": {
                            color: 0xcc2a36,
                            author: {
                                name: "Oh, Oh! No ha sido posible actualizar la configuración!",
                                icon_url: images.error_ico
                            },
                            "image": {
                                "url": images.error_gif,
                            }
                        }
                    });
            }
        }
        else if(args[0] == 'actual')
        {
            return message.channel.send({
                "embed": {
                        color: 0x00aedb,
                        author: {
                            name: "Configuración Actual:",
                            icon_url: images.actual_ico
                        },
                        fields: [{
                            name: "League:",
                            value: `${message.client.league == null ? 'Sin Establecer.' : message.client.league}`
                          },
                          {
                            name: "Refresh",
                            value: `${message.client.refresh == null ? 'Sin Establecer.' : `${message.client.refresh} minutos.`}`
                          }
                        ]
                    }
                });
        }
        else if(args[0] == 'help')
        {
            return help();
        }
        else 
        {
            return help();
        }

        function help() 
        {
            const configUsage = new Discord.RichEmbed()
                .setColor('#bf0a30')
                .setAuthor('Path Of Exile BOT', images.poe_logo)
                .setThumbnail(images.poe_logo)
                .addField('Para configurar tu league escribe:','.config league <legion>')
                .addField('Indica cada cuanto quieres refrescar la información (minutos):','.config refresh <10>')
                .addField('Para ver la configuración actual:','.config actual')
                .setFooter('Cuando acabes de configurarme podrás comenzar.');

            message.channel.send(configUsage);
        }

    },

};