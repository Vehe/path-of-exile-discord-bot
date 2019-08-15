const MongoClient = require('mongodb').MongoClient;
const Discord = require('discord.js');
const request = require('request');
const cron = require('node-cron');
const bot = new Discord.Client();
const fs = require('fs');

bot.commands = new Discord.Collection();
bot.alerts = new Map();
bot.league = null;
bot.refresh = null;
bot.mongostatus = true;
bot.db = null;

// Mongo server
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_URL}/?retryWrites=true&w=majority`;

/**
 * Busca en la carpeta commands todos los archivos JS y los almacena en una collection.
 */
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

/**
 * Se ejecuta cuando se conecta el bot al servidor.
 */
bot.once('ready', () => {

    bot.guilds.forEach(x => {
        bot.alerts.set(x.id, []);
    });

    if(!bot.guilds.first().channels.exists('name','path-of-exile-bot')) {
        bot.guilds.first().createChannel('path-of-exile-bot', { type: 'text' });
    }

    const configureMessage = new Discord.RichEmbed()
        .setColor('#bf0a30')
        .setAuthor('Path Of Exile BOT','https://www.pathofexile.com/image/war/logo.png')
        .setThumbnail('https://www.pathofexile.com/image/war/logo.png')
        .addField('Antes de continuar debes hacer un par de configuraciones!','Escribe \'.config help\' para ver la ayuda.')
        .setFooter('Cuando acabes de configurarme podrás comenzar.');

    setTimeout(function() {
        bot.channels.find('name','path-of-exile-bot').send(configureMessage);
    }, 2000);

    connectToDB();

    setTimeout(function() {
        setupAlerts();
    }, 2000);

});

/**
 * Se ejecuta cuando algún usuario envía un mensaje.
 */
bot.on('message', async message => {

    // Comprobamos que se llame al bot con el prefix correspondiente, así como dividir el comando de los argumentos.
    if (!message.content.startsWith('.') || message.author.bot || message.channel.name != 'path-of-exile-bot') return;
    const args = message.content.slice(1).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Comprobamos si esta configurada la league.
    //if(bot.league == null && commandName != "config") return message.reply('Establece una league antes de continuar!');
    
    if (!bot.commands.has(commandName)) return;
    const command = bot.commands.get(commandName);

    // Intentamos ejecutar el comando input del usuario, y le hacemos un catch al error.
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Ops! Ha habido algún error al ejecutar el comando!');
    }

});

/**
 * Inicializa las alertas de los items de la base de datos.
 * ! IMPROVE
 */
function setupAlerts()
{
    if(!bot.mongostatus) return;

    const guildAlerts = bot.db.collection('alerts');

    bot.guilds.forEach(x =>
    {
        const guildChannel = x.channels.find('name','path-of-exile-bot');
        
        guildAlerts.find({guildId:x.id}).toArray(function(err, res)
        {
            if(err) return;
            var tmp = [];

            res.forEach(i =>
            {
                var alertCron = cron.schedule(`*/${i.refresh} * * * *`, () => {

                    request({url:`https://poe.ninja/api/data/${(i.class == 'Currency' || i.class == 'Fragments') ? 'currencyoverview':'itemoverview'}?league=Legion&type=${i.class.replace(/\s+/g,'')}`, json:true}, function (error, response, body) {
                        if(error) return;
                        body['lines'].forEach(n =>
                        {
                            if(n['detailsId'] == i.itemName)
                            {
                                var currencyID = n['pay']['pay_currency_id'];
                                var itemImage = body['currencyDetails'][currencyID-1]['icon'].slice(0,-16);

                                var tmpMsg = {
                                    color: 0xeac100,
                                    thumbnail: {
                                        url: itemImage,
                                    },
                                    fields: [
                                        {
                                            name: `${x.emojis.find(emoji => emoji.name === i.class.replace(/\s+/g, ''))} ${i.itemShowName}`,
                                            value: '\u200b'
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: `Esta alerta se volvera a ejecutar dentro de ${i.refresh} minutos.`
                                    }
                                }
                                guildChannel.send({embed:tmpMsg});
                            }
                        });
                    });
                });

                alertCron.alert = i.itemName;
                tmp.push(alertCron);
            });

            bot.alerts.set(x.id, tmp);
        });
    });
}

/**
 * Iniciamos la conexión con la base de datos.
 * ! FIX: No reconecta cuanodo al iniciar el bot la base de datos esta caida.
 */
function connectToDB()
{
    const noConnectionMessage = new Discord.RichEmbed()
        .setColor('#eac100')
        .setAuthor('Path Of Exile BOT - Info','https://www.pathofexile.com/image/war/logo.png')
        .setThumbnail('https://www.pathofexile.com/image/war/logo.png')
        .addField('Parece que se ha perdido conexión con la base de datos!','Estamos intentando recuperar la conexión.')
        .setFooter('Ten paciencia porfavor.');
    
    const connectionMessage = new Discord.RichEmbed()
        .setColor('#85ef47')
        .setAuthor('Path Of Exile BOT - Info','https://www.pathofexile.com/image/war/logo.png')
        .setThumbnail('https://www.pathofexile.com/image/war/logo.png')
        .addField('Se ha restablecido la conexión con la base de datos!','Ya puede usar el bot con normalidad.')
        .setFooter('Gracias por su paciencia.');

    const client = new MongoClient(uri, { useNewUrlParser: true, reconnectTries: 10, reconnectInterval: 1000, autoReconnect: true });

    client.connect(function(err)
    {
        if(err)
        {
            bot.mongostatus = false;
            bot.channels.find('name','path-of-exile-bot').send(noConnectionMessage);
            return;
        }
        bot.db = client.db('items'); 
    });
    
    // Evento ejecutado cuando se pierde la conexión con la base de datos.
    client.on('close', function ()
    {
        bot.mongostatus = false;
        bot.channels.find('name','path-of-exile-bot').send(noConnectionMessage);
    });

    // Evento ejecutado cuando se recupera la conexión con la base de datos.
    client.on('reconnect', function ()
    {
        bot.mongostatus = true;
        bot.channels.find('name','path-of-exile-bot').send(connectionMessage);
    });
}

bot.login(process.env.BOT_TOKEN);