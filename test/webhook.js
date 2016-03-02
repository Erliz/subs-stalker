import assert from 'assert';
import superagent from 'superagent';
import sinon from 'sinon';
import web from './../src/web';
import eventEmitter from './../src/event';
import createLogger from './../src/logger';

const defaultScheme = 'http';
const defaultHost = 'localhost';
const defaultPort = '3001';
const defaultTestUrl = `${defaultScheme}://${defaultHost}:${defaultPort}/`;

// shout off logger
let logger = createLogger('webhook', 'error');
sinon.stub(logger, 'error');
web.setLogger(logger);

describe('webhook server', function () {
  beforeEach(() => web.run(defaultHost, defaultPort));
  afterEach(() => web.stop());

  it('should listen on default host and port', (done) => {
    superagent
      .post(defaultTestUrl)
      .end(done);
  });

  it('should not listen when stop on default host and port', (done) => {
    web.stop()
      .then(() => {
        superagent
          .post(defaultTestUrl)
          .end()
          .then(assert.fail, (err) => {
            if (err.code == 'ECONNREFUSED') {
              done();
            }
          });
      });
  });

  it('should response ok on test webhook', (done) => {
    let testQuery = {
      EventType: 'Test',
      Series: { Id: 1, Title: 'Test Title', Path: 'C:\\testpath', TvdbId: 1234 },
      Episodes: [
        {
          Id: 123,
          EpisodeNumber: 1,
          SeasonNumber: 1,
          Title: 'Test title',
          AirDate: null,
          AirDateUtc: null,
          Quality: null,
          QualityVersion: 0,
          ReleaseGroup: null,
          SceneName: null,
        },
      ],
    };
    superagent
      .post(defaultTestUrl)
      .send(testQuery)
      .end((error, res) => {
        assert.ifError(error);
        assert.equal(res.status, 200);
        done();
      });
  });

  it('should response ok on download webhook', (done) => {
    let testQuery = {
      EventType: 'Download',
      Series: { Id: 17, Title: 'Dimension W', Path: '/tv/anime/Dimension W', TvdbId: 299963 },
      Episodes: [
        {
          Id: 2263,
          EpisodeNumber: 7,
          SeasonNumber: 1,
          Title: 'The Voice Calling from the Past',
          AirDate: '2016-02-21',
          AirDateUtc: '2016-02-21T13:30:00Z',
          Quality: {
            id: 4,
            name: 'HDTV-720p',
          },
          QualityVersion: 1,
          ReleaseGroup: 'Ohys-Raws',
          SceneName: '[Ohys-Raws] Dimension W - 07 (MX 1280x720 x264 AAC)',
        },
      ],
    };
    superagent
      .post(defaultTestUrl)
      .send(testQuery)
      .end((error, res) => {
        assert.ifError(error);
        assert.equal(res.status, 200);
        done();
      });
  });

  it('should response ok and do nothing on grab webhook', (done) => {
    let testQuery = {
      EventType: 'Grab',
      Series: { Id: 16, Title: 'Haikyuu!!', Path: '/tv/anime/Haikyuu!!', TvdbId: 278157 },
      Episodes: [
        {
          Id: 278157,
          EpisodeNumber: 20,
          SeasonNumber: 2,
          Title: 'The Voice Calling from the Past',
          AirDate: '2016-02-21',
          AirDateUtc: '2016-02-21T13:30:00Z',
          Quality: {
            id: 4,
            name: 'HDTV-720p',
          },
          QualityVersion: 1,
          ReleaseGroup: 'Leopard-Raws',
          SceneName: '[Leopard-Raws] Haikyuu!! Second Season - 20 RAW (MBS 1280x720 x264 AAC)',
        },
      ],
    };
    superagent
      .post(defaultTestUrl)
      .send(testQuery)
      .end((error, res) => {
        assert.ifError(error);
        assert.equal(res.status, 200);
        done();
      });
  });

  it('should response not found', (done) => {
    superagent
      .get(defaultTestUrl)
      .end((error, res) => {
        assert.equal(error.message, 'Not Found');
        assert.equal(res.status, 404);
        done();
      });
  });

  it('should dispatch test event', (done) => {
    web.setEventEmitter(eventEmitter);
    eventEmitter.on('subs:test', () => done());
    superagent
      .post(defaultTestUrl)
      .send({
        EventType: 'Test',
      })
      .end((error, res) => {
        assert.ifError(error);
        assert.equal(res.status, 200);
      });
  });

  it('should dispatch webhook:request event', (done) => {
    web.setEventEmitter(eventEmitter);
    eventEmitter.on('subs:webhook:request', () => done());
    superagent
      .post(defaultTestUrl)
      .send({
        EventType: 'Download',
      })
      .end((error, res) => {
        assert.ifError(error);
        assert.equal(res.status, 200);
      });
  });
});
