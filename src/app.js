'use strict';
import {format as sprintf} from 'util';
import chokidar from 'chokidar';
import input from './command';
import web from './web';
import eventEmitter from './event';
import downloader from './downloader';
import createLogger from './../src/logger';
import {Notifier, transports as notifierTransports} from './notifier';
import PushBullet from 'pushbullet';

const API_VERSION = 'v0.1';
const API_KEY = input.apikey;
const URL_TEMPLATE = 'http://subs.erliz.ru/api/%s/%s/subtitle/get/';
const URL = sprintf(URL_TEMPLATE, API_VERSION, API_KEY);
const FOLDER = input.folder ? input.folder : '/tv/';

// download module
downloader.setLogger(createLogger('downloader'));
downloader.setEventEmitter(eventEmitter);
downloader.setUrl(URL);
function downloadHandler(event) {
    let series = event.Series;
    event.Episodes.forEach(function(episode){
        downloader.download({
                tvdbId: series.TvdbId,
                season: episode.SeasonNumber,
                episodeNum: episode.EpisodeNumber,
                releaseGroup: episode.ReleaseGroup,
                videoFileName: episode.SceneName + '.mp4' // workaround for subs parser
            },
            series.Path
        );
    });
}
eventEmitter.on('subs:webhook:request', downloadHandler);

// webhook module
if (input.webhook) {
    web.setLogger(createLogger('web'));
    web.setEventEmitter(eventEmitter);
    web.run();
}

// notify module
if (input.notify) {
    let notifier = new Notifier(
        [new notifierTransports.PushBulletTransport(new PushBullet(input.notifier_apikey), input.notifier_devices, createLogger('pushbullet-transport'))],
        'Subs-Stalker: '
    );
    eventEmitter.on('subs:download:success', function(filePath) {
        notifier.notify({title: 'Subtitle Downloaded', body: filePath.replace(/^\/.*\//, '')});
    });
    eventEmitter.on('subs:test', function(event) {
        notifier.notify({
            title:'Webhook test',
            body: `Series ${event.Series.Title} - Episode ${event.Episodes[0].EpisodeNumber}`
        });
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
