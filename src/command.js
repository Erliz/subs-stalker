import configure from 'commander';

configure
    .version('0.0.1')
    .usage('[options]')
    .option('-a, --apikey [value]', 'Api key for subs.erliz.ru to download subtitles')
    .option('-f, --folder [value]', 'Folder to watch on series files')
    .option('-n, --notify', 'Notify on downloads')
    .option('-w, --webhook', 'Run webhook listener')
    .option('--notifier_apikey [value]', 'Pushbullet api on downloads')
    .option('--notifier_devices [value]', 'Pushbullet devices ids')
    .parse(process.argv);

if (configure.notify) {
    let exit = false;
    if (!configure.apikey) {
        console.log('For downloading subs from subs.erliz.ru apikey need to be set as option "-a [ApiKey]"');
        exit = true;
    }
    if (!configure.notifier_apikey) {
        console.log('If --notify specify option --notifier_apikey is required');
        exit = true;
    }
    if (!configure.notifier_devices) {
        console.log('If --notify specify option --notifier_devices is required');
        exit = true;
    }
    if (exit) {
        process.exit(1);
    }
}

export default configure;
