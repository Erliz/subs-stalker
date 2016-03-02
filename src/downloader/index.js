import request from 'request';
import querystring from 'querystring';
import contentDisposition from 'content-disposition';
import url from 'url';
import fs from 'fs';
let serviceUrl = '';
let eventEmitter;
let logger = console;

const buildQuery = (tvdbId, season, episodeNum, releaseGroup, videoFileName) => {
  validateServiceUrl(serviceUrl);
  return serviceUrl + '?' + querystring.stringify({
    tvdbId,
    season,
    episodeNum,
    releaseGroup,
    videoFileName,
  });
};

const validateServiceUrl = (url) => {
  if (!url || !url.length) {
    throw new Error('Downloader base url should be not empty');
  }
};

const getFilePathToWrite = (seriesDir, seasonNum, fileName) => {
  return `${seriesDir.replace(/\/$/g, '')}/Season ${seasonNum}/${fileName}`;
};

const download = ({ tvdbId, season = 1, episodeNum, releaseGroup, videoFileName }, baseFolder) => {
  let query = buildQuery(tvdbId, season, episodeNum, releaseGroup, videoFileName);
  request
    .get(query)
    .on('error', err => {
      handleErrorResponse(err, query);
    })
    .on('response', res => {
      // i don`t know why 40* and 50* code are getting here
      if (res.statusCode === 200) {
        let fileName = getFileNameFromResponse(res);
        if (fileName) {
          res.pipe(writeFile(getFilePathToWrite(baseFolder, season, fileName)));
        }
      } else {
        handleErrorResponse(Object.assign(new Error(), res), query);
      }
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

const handleErrorResponse = (err, query) => {
  logger.error(`Response ${err.statusCode} with '${err.message}' on ${query}`);
  dispatch('subs:download:error', err);
};

const writeFile = (to) => {
  return fs.createWriteStream(to)
      .on('close', () => {
        logger.info(`Download success: ${to}`);
        dispatch('subs:download:success', to);
      });
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
