import { expect } from 'chai';
import sinon from 'sinon';

import { Episode } from '../src/documents';
import createWanted from '../src/wanted';
import createLogger from '../src/logger';
import createStorage from '../src/storage';

describe('Wanted', () => {

  let wanted;
  let logger = createLogger('wanted', 'error');

  const createEpisode = () => {
    return new Episode({
      tvdbId: 1,
      episodeNum: 1,
      seriesPath: '/tv/anime',
    });
  };

  sinon.stub(logger, 'error');

  beforeEach((done) => {
    wanted = createWanted({ logger, storagePath: ':memory:' }, done);
  });

  afterEach((done) => {
    wanted.destroy(done);
  });

  describe('add', () => {
    it('should once call callback', (done) => {
      wanted.add(createEpisode, done);
    });

    it('should callback with error if not episode document', (done) => {
      done(new Error('Not implemented'));
    });

    it('should add episode witch will be in `contains`', (done) => {
      done(new Error('Not implemented'));
    });

    it('should reject episode witch already in `contains`', (done) => {
      done(new Error('Not implemented'));
    });
  });

  describe('remove', () => {
    it('should once call callback', (done) => {
      done(new Error('Not implemented'));
    });

    it('should remove episode from `contains`', (done) => {
      done(new Error('Not implemented'));
    });

    it('should callback with error if episode already in `contains`', (done) => {
      done(new Error('Not implemented'));
    });
  });

  describe('contains', () => {
    it('should once call callback', (done) => {
      done(new Error('Not implemented'));
    });

    it('should callback with boolean', (done) => {
      done(new Error('Not implemented'));
    });

    it('should contain added episode', (done) => {
      done(new Error('Not implemented'));
    });
  });

  describe('list', () => {
    it('should once call callback', (done) => {
      done(new Error('Not implemented'));
    });

    it('should return array with episode documents', (done) => {
      done(new Error('Not implemented'));
    });

    it('should return array on empty', (done) => {
      done(new Error('Not implemented'));
    });
  });

  describe('watch', () => {
    it('should call downloader download method', (done) => {
      done(new Error('Not implemented'));
    });
  });

  describe.only('destroy', () => {
    it('should call storage close method', (done) => {
      let cb = (err) => done(err);
      let cbSpy = sinon.spy(cb);
      let storage = createStorage({});
      console.log(storage);
      storageSpy = sinon.spy(Object.getPrototypeOf(storage));
      wanted.destroy(cb);
    });
  });
});
