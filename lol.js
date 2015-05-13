var fis = module.exports = require('fis');

fis.name = 'lol';
fis.require.prefixes = [ 'lol', 'fis' ];
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];