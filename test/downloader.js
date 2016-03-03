import sinon from 'sinon';
import { expect } from 'chai';
import nock from 'nock';
import fsMock from 'mock-fs';
import querystring from 'querystring';

import fs from 'fs';
import createLogger from '../src/logger';
import downloader from '../src/downloader';
import eventEmitter from '../src/event';
import { Episode } from '../src/documents';

const emptyQuery = { tvdbId: 1, season: 1, episodeNum: 1, releaseGroup: '', videoFileName: '' };
const defaultResponseText = 'Tone of text';
const fakeServerDomain = 'http://test-subs-domain.com';
const fakeServerUrl = '/api/1001/v1.0/';
const fakeServerHeader = { 'Content-Disposition': 'attachment; filename="response_file.txt"' };

const createDefaultEpisode = (additional) => {
  return new Episode(Object.assign({
    tvdbId: 1,
    episodeNum: 1,
    seriesPath: '/tv/anime',
  }, additional));
};

const setupFakeServer = ({
    code = 200,
    query = emptyQuery,
    res = defaultResponseText,
    headers = fakeServerHeader,
  }) => {
    return nock(fakeServerDomain)
      .get(fakeServerUrl + '?' + querystring.stringify(query))
      .reply(code, res, headers);
  };

describe('downloader', () => {
  beforeEach(() => {
    downloader.setUrl(fakeServerDomain + fakeServerUrl);
    downloader.setEventEmitter(eventEmitter);
    let logger = createLogger('downloader', 'error');
    sinon.stub(logger, 'error');
    downloader.setLogger(logger);

    nock.disableNetConnect();
    fsMock({
      '/tv/anime/Season 1/': {},
    });
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    fsMock.restore();
  });

  describe('download', () => {
    it('should make request', (done) => {
      let fakeServer = setupFakeServer({});
      downloader.download(createDefaultEpisode());
      eventEmitter.once('subs:download:success', () => {
        fakeServer.done();
        done();
      });
    });

    it('should put received text to file', (done) => {
      let fakeServer = setupFakeServer({});
      downloader.download(createDefaultEpisode());
      eventEmitter.once('subs:download:success', (episode) => {
        fs.readFile(episode.subtitleFilePath, (err, res) => {
          if (err) {
            done(err);
          }

          expect(res.toString()).to.be.equal(defaultResponseText);
          fakeServer.done();
          done();
        });
      });
    });

    it('should dispatch error on 404', (done) => {
      let fakeServer = setupFakeServer({ code: 404 });
      downloader.download(createDefaultEpisode());
      eventEmitter.once('subs:download:error', (err) => {
        expect(err).to.be.instanceof(Error).with.property('statusCode').to.be.equal(404);
        fakeServer.done();
        done();
      });
    });

    it('should dispatch error on bad query', (done) => {
      let fakeServer = setupFakeServer({ query: {} });
      downloader.download(createDefaultEpisode());
      eventEmitter.once('subs:download:error', (err) => {
        expect(err).to.be.instanceof(Error).with.property('statusCode').to.be.equal(404);
        done();
      });
    });

    it('should dispatch error if no content-disposition', (done) => {
      let fakeServer = setupFakeServer({ headers: {} });
      downloader.download(createDefaultEpisode());
      eventEmitter.once('subs:download:error', (err) => {
        expect(err).to.be.instanceof(Error)
          .with.property('message').that.string('content-disposition');
        fakeServer.done();
        done();
      });
    });
  });

  describe('logger', () => {
    it('should successfully set empty', () => {
      downloader.setLogger(null);
    });

    it('should successfully set winston', () => {
      downloader.setLogger(createLogger('logger'));
    });
  });

  describe('event emitter', () => {
    it('should successfully set empty', () => {
      downloader.setEventEmitter(null);
    });

    it('should successfully set EventEmitter2', () => {
      downloader.setEventEmitter(eventEmitter);
    });
  });

  describe('url', () => {
    it('should throw error if set empty', () => {
      let isCaught = false;
      try {
        downloader.setUrl(null);
      } catch (e) {
        isCaught = true;
        expect(e).to.be.an.instanceof(Error).with.property('message').that.string('empty');
      }

      expect(isCaught).to.be.true;
    });

    it('should successfully set http url', () => {
      downloader.setUrl('http://example.com/');
    });
  });

});
