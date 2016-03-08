import { expect } from 'chai';
import sinon from 'sinon';

import { Episode } from '../src/documents';
import createWanted from '../src/wanted';
import createLogger from '../src/logger';
import createStorage from '../src/storage';

describe('wanted', () => {

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
    wanted.destroy(err => {
      if (err) {
        if (/^SQLITE_MISUSE/.test(err.message)) {
          done();
        } else {
          done(err);
        }
      } else {
        done();
      }
    });
  });

  describe('add', () => {
    it('should once call callback', (done) => {
      wanted.add(createEpisode(), done);
    });

    it('should callback with error if not episode document', (done) => {
      wanted.add({ name: 'test_name', episodeNum: 31 }, done);
    });

    it('should add episode witch will be in `contains`', (done) => {
      let episode = createEpisode();
      wanted.add(episode, (err, res) => {
        if (err) done(err);
        expect(res).to.be.equal(episode);
        wanted.contains(episode, (err, res) => {
          if (err) done(err);
          expect(res).to.be.true;
          done();
        });
      });
    });

    it('should reject episode witch already in `contains`', done => {
      let episode = createEpisode();
      wanted.add(episode, (err) => {
        if (err) done(err);
        wanted.add(episode, (err, res) => {
          expect(err).to.be.instanceof(Error).with.property('message').that.match(/already/i);
          done();
        });
      });
    });
  });

  describe('remove', () => {
    it('should once call callback', done => {
      let episode = createEpisode();
      wanted.add(episode, (err) => {
        if (err) done(err);
        wanted.remove(episode, done);
      });
    });

    it('should remove episode from `contains`', done => {
      let episode = createEpisode();
      wanted.add(episode, (err) => {
        if (err) done(err);
        wanted.remove(episode, (err) => {
          if (err) done(err);
          wanted.contains(episode, (err, res) => {
            if (err) done(err);
            expect(res).to.be.false;
            done();
          });
        });
      });
    });

    it('should callback with error if episode to remove not in `contains`', done => {
      let episode = createEpisode();
      wanted.remove(episode, (err) => {
        expect(err).to.be.instanceof(Error).with.property('message').that.match(/no subtitles/i);
        done();
      });
    });
  });

  describe('contains', () => {
    it('should once call callback', done => {
      let episode = createEpisode();
      wanted.add(episode, (err) => {
        if (err) done(err);
        wanted.contains(episode, done);
      });
    });

    it('should callback with false if no such episode', done => {
      let episode = createEpisode();
      wanted.contains(episode, (err, res) => {
        expect(res).to.be.false;
        done();
      });
    });

    it('should callback with true if contain added episode', done => {
      let episode = createEpisode();
      wanted.add(episode, (err) => {
        if (err) done(err);
        wanted.contains(episode, (err, res) => {
          expect(res).to.be.true;
          done();
        });
      });
    });
  });

  describe('watch', () => {
    it('should call downloader download method', done => {
      let downloader = {
        download: sinon.stub(),
      };
      let episode = createEpisode();
      wanted.add(episode, err => {
        if (err) done(err);
        wanted.watch(downloader, 0);
        setTimeout(() => {
          downloader.download.calledWith(episode);
          done();
        });
      });
    });
  });

  describe('destroy', () => {
    it('should call storage close method', (done) => {
      wanted.destroy(done);
    });
  });
});
