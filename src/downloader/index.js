import request from 'request';
import querystring from 'querystring';
import contentDisposition from 'content-disposition';
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
    .get(query, (err, res, body) => {
      if (err) {
        handleErrorResponse(err, episode);
        return;
      }

      handleResponse(res, body, episode);
    });
};

const getFileNameFromResponse = (res) => {
  let header = res.headers['content-disposition'];
  if (!header) {
    let err = new Error('Response have no "content-disposition" in header');
    logger.error(err.message);
    dispatch('subs:download:error', { err });
    return;
  }

  return contentDisposition.parse(header).parameters.filename;
};

const handleResponse = (res, body, episode) => {
  // i don`t know why 40* and 50* code are getting here
  if (res.statusCode === 200) {
    let fileName = getFileNameFromResponse(res);
    if (fileName) {
      fs.access(episode.subtitleFilePath, fs.F_OK, function(err) {
        if (err) {
          logger.error(err.message);
          dispatch('subs:download:error', { err, episode });
          return;
        }
        episode.subtitleFileName = fileName;
        let writeStream = fs.createWriteStream(episode.subtitleFilePath);
        writeStream.on('close', () => {
          logger.info(`Download success: ${episode.subtitleFilePath}`);
          dispatch('subs:download:success', episode);
        });
        writeStream.write(body);
        writeStream.end();
      });
    }
  } else {
    handleErrorResponse(Object.assign(new Error(res.body), res), episode);
  }
};

const handleErrorResponse = (err, episode) => {
  logger.error(`Response ${err.statusCode} with '${err.message}' on ${buildQuery(episode)}`);
  dispatch('subs:download:error', { err, episode });
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
