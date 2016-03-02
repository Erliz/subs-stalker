import request from 'request';
import querystring from 'querystring';
import contentDisposition from 'content-disposition';
import url from 'url';
import fs from 'fs';
let serviceUrl = '';
let eventEmitter;
let logger = console;

const buildQuery = ({ tvdbId, seasonNum, episodeNum, releaseGroup, videoFileName }) => {
  validateServiceUrl(serviceUrl);
  return serviceUrl + '?' + querystring.stringify({
    tvdbId: tvdbId,
    season: seasonNum,
    episodeNum: episodeNum,
    releaseGroup: releaseGroup,
    videoFileName: videoFileName,
  });
};

const validateServiceUrl = (url) => {
  if (!url || !url.length) {
    throw new Error('Downloader base url should be not empty');
  }
};

const download = (episode) => {
  let query = buildQuery(episode);
  request
    .get(query)
    .on('error', err => {
      handleErrorResponse(err, episode);
    })
    .on('response', res => {
      handleResponse(res, episode);
    });
};

const getFileNameFromResponse = (res) => {
  let header = res.headers['content-disposition'];
  if (!header) {
    let err = new Error('Response have no "content-disposition" in header');
    logger.error(err.message);
    dispatch('subs:download:error', err);
    return;
  }

  return contentDisposition.parse(header).parameters.filename;
};

const handleResponse = (res, episode) => {
  // i don`t know why 40* and 50* code are getting here
  if (res.statusCode === 200) {
    let fileName = getFileNameFromResponse(res);
    if (fileName) {
      episode.subtitleFileName = fileName;
      let writeStream = fs.createWriteStream(episode.subtitleFilePath);
      writeStream.on('close', () => {
        logger.info(`Download success: ${episode.subtitleFilePath}`);
        dispatch('subs:download:success', episode);
      });
      res.pipe(writeStream);
    }
  } else {
    handleErrorResponse(Object.assign(new Error(), res), episode);
  }
};

const handleErrorResponse = (err, episode) => {
  logger.error(`Response ${err.statusCode} with '${err.message}' on ${episode}`);
  dispatch('subs:download:error', err);
};

const dispatch = (eventName, event) => {
  if (eventEmitter) {
    eventEmitter.emit(eventName, event);
  }
};

const setUrl = (url) => {
  validateServiceUrl(url);
  serviceUrl = url;
};

const setEventEmitter = (emitter) => {
  eventEmitter = emitter;
};

const setLogger = (log) => {
  logger = log;
};

export default { setUrl, setEventEmitter, setLogger, download };
