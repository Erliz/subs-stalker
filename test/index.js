'use strict';
//require('./../src/index.js');
let assert = require('assert');
let superagent = require('superagent');

describe('server', function() {
    //it('process test webhook', function(done){
    //    let testQuery = {
    //        EventType: 'Test',
    //        Series: {Id: 1, Title: 'Test Title', Path: 'C:\\testpath', TvdbId: 1234},
    //        Episodes: [{
    //            Id: 123,
    //            EpisodeNumber: 1,
    //            SeasonNumber: 1,
    //            Title: 'Test title',
    //            AirDate: null,
    //            AirDateUtc: null,
    //            Quality: null,
    //            QualityVersion: 0,
    //            ReleaseGroup: null,
    //            SceneName: null
    //        }]
    //    };
    //    superagent
    //        .post('http://localhost:3000/')
    //        .send(testQuery)
    //        .end(function(error, res) {
    //        assert.ifError(error);
    //        assert.equal(res.status, 200);
    //        done();
    //    });
    //});

    it('process casual download webhook', function(done){
        let testQuery = {
            EventType: 'Download',
            Series: {Id: 17, Title: 'Dimension W', Path: '/tv/anime/Dimension W', TvdbId: 299963},
            Episodes: [{
                Id: 2263,
                EpisodeNumber: 6,
                SeasonNumber: 1,
                Title: 'The Voice Calling from the Past',
                AirDate: '2016-02-21',
                AirDateUtc: '2016-02-21T13:30:00Z',
                Quality: {
                    "id": 4,
                    "name": "HDTV-720p"
                },
                QualityVersion: 1,
                ReleaseGroup: 'Ohys-Raws',
                SceneName: '[Ohys-Raws] Dimension W - 06 (MX 1280x720 x264 AAC)'
            }]
        };
        superagent
            .post('http://localhost:3000/')
            .send(testQuery)
            .end(function(error, res) {
            assert.ifError(error);
            assert.equal(res.status, 200);
            done();
        });
    });
});
