import {format as sprintf} from 'util';
import chokidar from 'chokidar';
import parser from './parser';
import * as notifier from './notifier';
let args = parser.args();

const API_VERSION = 'v0.1';
const API_KEY = args['apikey'];
const URL_TEMPLATE = 'http://subs.erliz.ru/api/%s/%s/subtitle/get/';
const URL = sprintf(URL_TEMPLATE, API_VERSION, API_KEY);
const FOLDER = args['folder'] ? args['folder'] : '/tv/';

notifier.init(args['notifier-apikey'], args['devices']);
notifier.notify('test is success');

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
