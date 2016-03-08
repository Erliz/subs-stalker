import { expect } from 'chai';
import sinon from 'sinon';

import { Episode } from '../src/documents';
import createStorage from '../src/storage';
import createLogger from '../src/logger';


const createEpisode = () => {
  return new Episode({
    tvdbId: 1,
    episodeNum: 1,
    seriesPath: '/tv/anime',
  });
};

describe('storage', () => {

  let storage;

  beforeEach((done) => {
    const handleConnectionSucceed = (err) => {
      if (err) done(err);
      storage.createTable('wanted', (err) => {
        done(err);
      });
    };

    let logger = createLogger('storage', 'error');
    sinon.stub(logger, 'error');
    storage = createStorage({ logger }, handleConnectionSucceed);
  });

  afterEach((done) => {
    storage.close(done);
  });

  it('should call callback on init', (done) => {
    createStorage({}, (err) => {
      done(err);
    });
  });

  it('should call callback with error on bad table name argument', (done) => {
    storage.createTable('table_name', (err) => {
      expect(err).to.be.instanceof(Error).with.property('message').that.have.string('table_name');
      done();
    });
  });

  it('should drop table', (done) => {
    storage.dropTable('wanted', (err) => {
      if (err) done(err);
      storage.persist('wanted', createEpisode, (err) => {
        expect(err).to.be.instanceof(Error)
          .with.property('message').that.have.string('no such table: wanted');
        done();
      });
    });
  });

  it('should add episode', (done) => {
    storage.persist('wanted', createEpisode(), (err) => {
      if (err) done(err);
      storage.findAll('wanted', (err, list) => {
        if (err) done(err);
        expect(list).to.be.an('Array').with.length(1);
        done();
      });
    });
  });

  it('should add episode and return in callback the same object with id set', (done) => {
    let newEpisode = createEpisode();
    storage.persist('wanted', newEpisode, (err, episode) => {
      if (err) done(err);
      expect(episode).to.be.equal(newEpisode);
      expect(episode).have.property('id').that.equal(1);
      done();
    });
  });

  it('should remove episode', (done) => {
    let shouldRemoveEpisode = createEpisode();
    storage.persist('wanted', shouldRemoveEpisode, (err) => {
      if (err) done(err);
      storage.persist('wanted', createEpisode(), (err) => {
        if (err) done(err);
        storage.remove('wanted', shouldRemoveEpisode, (err) => {
          if (err) done(err);
          storage.findAll('wanted', (err, list) => {
            expect(list).to.be.an('Array').with.length(1);
            done(err);
          });
        });
      });
    });
  });

  it('should callback with error on remove episode with no id', (done) => {
    let shouldRemoveEpisode = createEpisode();
    storage.persist('wanted', shouldRemoveEpisode, (err) => {
      if (err) done(err);
      storage.remove('wanted', { id: null }, (err) => {
        expect(err).to.be.instanceof(Error).with.property('message').that.have.string('without id');
        done();
      });
    });
  });

  it('should return list of episodes documents', (done) => {
    storage.persist('wanted', createEpisode(), (err) => {
      if (err) done(err);
      storage.persist('wanted', createEpisode(), (err) => {
        if (err) done(err);
        storage.findAll('wanted', (err, list) => {
          if (err) done(err);
          expect(list).to.be.an('Array').with.length(2);
          list.forEach(episode => {
            expect(episode).to.be.instanceof(Episode);
          });
          done();
        });
      });
    });
  });

  it('should return empty list', (done) => {
    storage.findAll('wanted', (err, list) => {
      if (err) done(err);
      expect(list).to.be.an('Array').with.length(0);
      done();
    });
  });

  it('should return error in callback if table doesn`t exist', (done) => {
    storage.findAll('test', (err) => {
      expect(err).to.be.instanceof(Error)
        .with.property('message').that.have.string('no such table: test');
      done();
    });
  });
});
