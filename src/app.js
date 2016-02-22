'use strict';
import {format as sprintf} from 'util';
import chokidar from 'chokidar';
import parser from './parser';
import input from './command';
import web from './web';
import eventEmitter from './event';
import downloader from './downloader';
import notifier from './notifier';
//let args = parser.args();

const API_VERSION = 'v0.1';
const API_KEY = input.apikey;
const URL_TEMPLATE = 'http://subs.erliz.ru/api/%s/%s/subtitle/get/';
const URL = sprintf(URL_TEMPLATE, API_VERSION, API_KEY);
const FOLDER = input.folder ? input.folder : '/tv/';

// download module
downloader.setEventEmitter(eventEmitter);
downloader.setUrl(URL);
function downloadHandler(event) {
    let series = event.Series;
    event.Episodes.forEach(function(episode){
        downloader.download(
            series.TvdbId,
            episode.SeasonNumber,
            episode.EpisodeNumber,
            episode.ReleaseGroup,
            episode.SceneName + '.mp4', // workaround for subs parser
            series.Path
        );
    });
}
eventEmitter.on('subs:test', downloadHandler);
eventEmitter.on('subs:webhook:request', downloadHandler);

// webhook module
if (input.webhook) {
    web.setEventEmitter(eventEmitter);
    web.run();
}

// notify module
if (input.notify) {
    notifier.init(input.notifier_apikey, input.notifier_devices);
    eventEmitter.on('subs:download', function(event) {
        notifier.notify(event, 'Subtitle Downloaded');
    });
    eventEmitter.on('subs:test', function(event) {
        notifier.notify(`Series ${event.Series.Title} - Episode ${event.Episodes[0].EpisodeNumber}`, 'Webhook test');
    });
}



//eventEmitter.emit('subs:download', 'Naruto - 087');

// watcher module
//process.exit();
//const extensionsToWatch = [
//    // video
//    'mp4',
//    'avi',
//    'mkv',
//    // subs
//    'ass',
//    'srt', // SubRipper
//    'sub', // SubViewer
//    'ssa', // SubStation Alpha
//    'mdv', // MicroDVD
//    'smi', // SAMI
//    's2k'  // Sasami2k
//];
//
//const pathWatchMask = FOLDER + '/**/*.%s';
//let pathsToWatch = [];
//
//extensionsToWatch.forEach(function($extension){
//    pathsToWatch.push(sprintf(pathWatchMask, $extension));
//});
//
//console.log(pathsToWatch);
//
//chokidar.watch(pathsToWatch, {ignored: /[\/\\]\./}).on('all', (event, path) => {
//    console.log(event, path);
//});
