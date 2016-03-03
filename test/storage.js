import {expect} from 'chai';

import documents from '../src/documents';
import createStorage from '../src/storage';
import createLogger from './../src/logger';

let storage;

const createEpisode = () => {
  return new documents.Episode({
    tvdbId: 1,
    episodeNum: 1,
    seriesPath: '/tv/anime',
  });
};

describe('storage', () => {
  beforeEach((done) => {
    const handleConnectionSucceed = (err) => {
      if (err) done(err);
      storage.createTable('wanted', (err) => {
        done(err);
      });
    };

    storage = createStorage({ logger: createLogger('storage', 'error') }, handleConnectionSucceed);
  });

  afterEach((done) => {
    storage.close(done);
  });

  it('should call callback on init', (done) => {
    createStorage({ logger: createLogger('storage', 'error') }, (err) => {
      done(err);
    });
  });

  it('should add episode', (done) => {
    storage.persist('wanted', createEpisode(), (err) => {
      if (err) done(err);
      storage.findAll('wanted', (err, list) => {
        expect(list).to.be.an('Array').with.length(1);
        done(err);
      });
    });
  });

});
