import request from 'request';
import querystring from 'querystring';
import contentDisposition from 'content-disposition';
import url from 'url';
import fs from 'fs';
let serviceUrl;
let eventEmitter;

function buildQuery(tvdbId, season, episodeNum, releaseGroup, videoFileName) {
    return serviceUrl + '?' +querystring.stringify({
        tvdbId,
        season,
        episodeNum,
        releaseGroup,
        videoFileName
    })
}

function handleResponse(error, res, body) {
    if (error) {
        console.log(error);
    }

    let query = url.parse(res.request.path, true).query;
    if (res.statusCode == 200) {
        let fileName = contentDisposition.parse(res.headers['content-disposition']).parameters.filename;
        let path = getFilePathToWrite(this.to, query.season, fileName);
        fs.writeFile(path, body, (err) => {
            if (err) {
                console.log(`Fail file write into path ${path}`);
                console.log(err);
            } else {
                console.log(`Success file write into path ${path}`);
                eventEmitter.emit('subs:download', fileName);
            }
        });
    } else if (res.statusCode == 404) {
        let data = JSON.parse(body);
        console.log(`Downloader response status code ${res.statusCode}`);
        console.log(`Request params: ${JSON.stringify(query)}`);
        console.log(`Request url: ${res.request.href}`);
        console.log(`Response: ${data.error}`);
    }
}

function getFilePathToWrite(seasonDir, seasonNum, fileName) {
    return `${seasonDir}/Season ${seasonNum}/${fileName}`;
}

function download(tvdbId, season, episodeNum, releaseGroup, videoFileName, to) {
    let query = buildQuery(tvdbId, season, episodeNum, releaseGroup, videoFileName);
    request.get(query, {}, handleResponse.bind({to}));
}

function setUrl(url) {
    serviceUrl = url;
}

function setEventEmitter(emitter) {
    eventEmitter = emitter;
}

export default {setUrl, setEventEmitter, download}
