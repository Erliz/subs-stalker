import {expect} from 'chai';

import documents from '../src/documents';

describe('documents', () => {
  describe('Episode', () => {
    it('should create instance', () => {
      let episode = new documents.Episode({
        tvdbId: 1,
        episodeNum: 1,
        seriesPath: '/tv/anime/',
      });
      expect(episode).to.be.instanceof(documents.Episode);
    });

    it('should throw error if tvdbId not set', () => {
      let isCaught = false;
      try {
        new documents.Episode({
          episodeNum: 1,
          seriesPath: '/tv/anime/',
        });
      } catch (e) {
        isCaught = true;
        expect(e).to.be.instanceof(Error).with.property('message').that.have.string('tvdbId');
      }

      expect(isCaught).to.be.true;
    });

    it('should throw error if episodeNum not set', () => {
      let isCaught = false;
      try {
        new documents.Episode({
          tvdbId: 1,
          seriesPath: '/tv/anime/',
        });
      } catch (e) {
        isCaught = true;
        expect(e).to.be.instanceof(Error).with.property('message').that.have.string('episodeNum');
      }

      expect(isCaught).to.be.true;
    });

    it('should throw error if seriesPath not set', () => {
      let isCaught = false;
      try {
        new documents.Episode({
          tvdbId: 1,
          episodeNum: 1,
        });
      } catch (e) {
        isCaught = true;
        expect(e).to.be.instanceof(Error).with.property('message').that.have.string('seriesPath');
      }

      expect(isCaught).to.be.true;
    });

    it('should set required properties on construct', () => {
      let episode = new documents.Episode({
        tvdbId: 1,
        episodeNum: 1,
        seriesPath: '/tv/anime',
      });

      expect(episode.tvdbId).to.be.equal(1);
      expect(episode.episodeNum).to.be.a('string').and.equal('1');
      expect(episode.seriesPath).to.be.equal('/tv/anime');
    });

    it('should set additional properties on construct', () => {
      let episode = new documents.Episode({
        tvdbId: 1,
        episodeNum: 1,
        seriesPath: '/tv/anime',

        id: 1203,
        seasonNum: 1,
        releaseGroup: 'Group Test Name',
        videoFileName: 'Video.mp4',
        seriesTitle: 'Test Title',
      });

      expect(episode.id).to.be.equal(1203);
      expect(episode.seasonNum).to.be.equal(1);
      expect(episode.releaseGroup).to.be.equal('Group Test Name');
      expect(episode.videoFileName).to.be.equal('Video.mp4');
      expect(episode.seriesTitle).to.be.equal('Test Title');
    });

    it('should set episode path properties', () => {
      let episode = new documents.Episode({
        tvdbId: 1,
        episodeNum: 1,
        seriesPath: '/tv/anime',
      });
      episode.episodePath = episode.seriesPath + '/Video.mp4';
      expect(episode.seasonNum).to.be.equal(1);
    });
  });
});
