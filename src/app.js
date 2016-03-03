'use strict';

import {format as sprintf} from 'util';
import chokidar from 'chokidar';
import settings from './command';
import web from './web';
import eventEmitter from './event';
import downloader from './downloader';
import createLogger from './../src/logger';
import {Notifier, transports as notifierTransports} from './notifier';
import PushBullet from 'pushbullet';
import documents from './documents';
import createWanted from './wanted';

const API_VERSION = 'v0.1';
const API_KEY = settings.apikey;
const URL_TEMPLATE = 'http://subs.erliz.ru/api/%s/%s/subtitle/get/';
const URL = sprintf(URL_TEMPLATE, API_VERSION, API_KEY);
const FOLDER = settings.folder ? settings.folder : '/tv/';

// download module
downloader.setLogger(createLogger('downloader'));
downloader.setEventEmitter(eventEmitter);
downloader.setUrl(URL);
const downloadHandler = (event) => {
  let series = event.Series;
  event.Episodes.forEach((episode) => {
    downloader.download(new documents.Episode({
      tvdbId: series.TvdbId,
      season: episode.SeasonNumber,
      episodeNum: episode.EpisodeNumber,
      releaseGroup: episode.ReleaseGroup,
      videoFileName: episode.SceneName + '.mp4', // workaround for subs parser
      seriesPath: series.Path,
      seriesTitle: series.Title,
    }));
  });
};

eventEmitter.on('subs:webhook:request', downloadHandler);

// webhook module
if (settings.webhook) {
  web.setLogger(createLogger('web'));
  web.setEventEmitter(eventEmitter);
  web.run();
}

// notify module
if (settings.notify) {
  let notifier = new Notifier(
    [
      new notifierTransports.PushBulletTransport(
        new PushBullet(settings.notifierApikey),
        settings.notifierDevices,
        createLogger('pushbullet-transport')
      ),
    ],
    'Subs-Stalker: '
  );
  eventEmitter.on('subs:download:success', (episode) => {
    notifier.notify({ title: 'Subtitle Downloaded', body: episode.subtitleFileName });
  });
  eventEmitter.on('subs:test', (event) => {
    notifier.notify({
      title:'Webhook test',
      body: `Series ${event.Series.Title} - Episode ${event.Episodes[0].EpisodeNumber}`,
    });
  });
}

// notify module
if (settings.wanted) {
  let wanted = createWanted(createLogger('wanted'));
  eventEmitter.on('subs:download:success', wanted.remove);
  eventEmitter.on('subs:download:error', wanted.add);
  wanted.watch(downloader);
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
