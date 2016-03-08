import sqlite3 from 'sqlite3';

import { Episode } from '../documents';

export default ({ dbLocation = ':memory:', logger = console }, callback = () => {}) => {
  let db = new sqlite3.Database(dbLocation, callback);

  db.on('profile', (query, time) => {
    logger.info(`"${query}" by ${time} ms`);
  });

  const createTable = (table, callback = () => {}) => {
    switch (table) {
      case 'wanted':

        // rowid create automatically
        db.run(
          'CREATE TABLE IF NOT EXISTS `wanted` (' +
          '`tvdbId` INT NOT NULL,' +
          '`episodeNum` TEXT NOT NULL,' +
          '`seriesPath` TEXT NOT NULL,' +
          '`seasonNum` INT NOT NULL,' +
          '`releaseGroup` TEXT,' +
          '`videoFileName` TEXT,' +
          '`subtitleFileName` TEXT,' +
          '`seriesTitle` TEXT)',
          [],
          callback
        );
        break;
      default:
        let errorText = `Undefined scheme for table "${table}"`;
        logger.error(errorText);
        callback(new Error(errorText), null);
    }
  };

  const dropTable = (table, callback = () => {}) => {
    db.run(`DROP TABLE ${table}`, callback);
  };

  // save episode in db
  const persist = (table, episode, callback = () => {}) => {
    db.run(
      'INSERT INTO ' + table + ' ' +
      '(tvdbId, episodeNum, seriesPath, seasonNum, releaseGroup, ' +
      'videoFileName, subtitleFileName, seriesTitle) ' +
      ' VALUES (' + serialize(episode) + ');',
      [],
      function (err) {
        if (err) {
          callback(err, null);
          return;
        }

        episode.id = this.lastID;
        callback(err, episode);
      }
    );
  };

  // remove episode from db
  const remove = (table, episode, callback = () => {}) => {
    if (!episode.id) {
      callback(new TypeError('Fail to remove episode without id'), null);
      return;
    }

    db.run(`DELETE FROM ${table} WHERE rowid = ?;`, [episode.id], callback);
  };

  // find all episodes by type
  const findAll = (table, callback) => {
    db.all(`SELECT rowid as id, * FROM ${table}`, [], (err, list) => {
      if (err) {
        callback(err, null);
        return;
      }

      let episodes = list.map((row) => {
        return new Episode(row);
      });
      callback(null, episodes);
    });
  };

  const serialize = (episode) => {
    return '"' + [
        episode.tvdbId,
        episode.episodeNum,
        episode.seriesPath,
        episode.seasonNum,
        episode.releaseGroup,
        episode.videoFileName,
        episode.subtitleFileName,
        episode.seriesTitle,
      ].join('","') + '"';
  };

  const close = (callback) => {
    db.close(callback);
  };

  return {
    findAll,
    persist,
    remove,
    createTable,
    dropTable,
    close,
  };
};
