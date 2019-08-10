const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.commands = new Discord.Collection();
bot.league = null;
bot.refresh = null;

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

    // Crea un canal dedicado para el bot al iniciar.
    console.log(`Conectado al servidor como: ${bot.user.tag}`);

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
    }, 500);

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
    if(bot.league == null && commandName != "config") return message.reply('Establece una league antes de continuar!');
    
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

bot.login(process.env.BOT_TOKEN);