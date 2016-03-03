import sqlite3 from 'sqlite3';

export default ({ dbLocation = ':memory:', logger = console }, callback) => {
  let db = new sqlite3.Database(dbLocation, callback);

  db.on('profile', (query, time) => {
    logger.info(`"${query}" by ${time} sec`);
  });

  const createTable = (table, callback) => {
    switch (table) {
      case 'wanted':
        db.run(
          'CREATE TABLE IF NOT EXISTS `wanted` (' +
          '`id` INT PRIMARY KEY,' +
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
        logger.error(`Undefined scheme for table "${table}"`);
    }
  };

  const dropTable = (table, callback) => {
    db.run(`DROP TABLE ${table}`, callback);
  };

  // save episode in db
  const persist = (table, episode, callback) => {
    db.run(
      'INSERT INTO ' + table + ' ' +
      '(id, tvdbId, episodeNum, seriesPath, seasonNum, releaseGroup, ' +
      'videoFileName, subtitleFileName, seriesTitle) ' +
      ' VALUES (' + serialize(episode) + ');',
      [],
      callback);
  };

  // remove episode from db
  const remove = (table, episode, callback) => {
    if (!episode.id) {
      callback(new TypeError('Fail to remove episode without id'), null);
    }

    db.run(`DELETE FROM ${table} WHERE id = ?;`, [episode.id], callback);
  };

  // find all episodes by type
  const findAll = (table, callback) => {
    db.all(`SELECT * FROM ${table}`, [], callback);
  };

  const serialize = (episode) => {
    return '"' + [
        episode.id,
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

  const setLogger = (logService) => {
    logger = logService;
  };

  const setDbLocation = (path) => {
    dbLocation = path;
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
    setLogger,
    setDbLocation,
    close,
  };
};
