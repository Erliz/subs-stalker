// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import configure from 'commander';

configure
  .version('0.0.1')
  .usage('[options]')
  .option('-a, --apikey [value]', 'Api key for subs.erliz.ru to download subtitles')
  .option('-f, --folder [value]', 'Folder to watch on series files')
  .option('-n, --notify', 'Notify on downloads')
  .option('-w, --webhook', 'Run webhook listener')
  .option('--stalk', 'Stalk for wanted subtitles')
  .option('--notifier_apikey [value]', 'PushBullet api on downloads')
  .option('--notifier_devices [value]', 'PushBullet devices ids')
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

  // normalize argument name
  configure.notifierApikey = configure.notifier_apikey;
  configure.notifierDevices = configure.notifier_devices;

  if (exit) {
    process.exit(1);
  }
}

export default configure;
