import createStorage from '../storage';

export default ({ logger = console }) => {

  let storageName = 'wanted';
  let storagePath = 'config/db.sqlite';
  let storage = createStorage({ logger, dbLocation: storagePath });

  // get all wanted episodes episodes from storage
  const list = (callback) => {
    storage.findAll(storageName, callback);
  };

  // is episode already in storage
  const contains = (episode, callback) => {
    if (!episode.id) {
      callback(null, false);
    }

    list((err, episodesList) => {
      if (err) callback(err, null);
      callback(null, episodesList.some(inStorageEpisode => inStorageEpisode.id === episode.id));
    });
  };

  // add episode to storage
  const add = (episode, callback) => {
    contains(episode, (err, isExist) => {
      if (err) callback(err, null);
      if (!isExist) {
        storage.persist(storageName, episode, (err) => {
          if (err) callback(err, null);
          callback(null, episode);
          logger.info(
            `Added to wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`
          );
        });
      } else {
        logger.info(
          `Already wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`
        );
      }
    });
  };

  // remove episode from storage
  const remove = (episode, callback) => {
    contains(episode, (err, isExist) => {
      if (err) callback(err, null);
      if (isExist) {
        storage.remove(storageName, episode, (err) => {
          if (err) callback(err, null);
          callback(null, episode);
          logger.info(
            `Remove from wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`
          );
        });
      } else {
        logger.info(
          `No subtitles in wanted to remove for ${episode.seriesTitle} ep ${episode.episodeNum}`
        );
      }
    });
  };

  /**
   * watcher for not downloaded subtitles
   * @param downloader instance
   */
  const watcher = (downloader) => {
    list((err, list) => {
      if (err) throw err;
      list.forEach((episode) => {
        downloader.download(episode);
      });
    });
    setTimeout(() => {
      watcher(downloader);
    }, 10 * 60 * 1000);
  };

  const setLogger = (logService) => {
    logger = logService;
    storage.setLogger(logService);
  };

  const setStorageName = (name) => {
    storageName = name;
  };

  return {
    add,
    contains,
    remove,
    list,
    setLogger,
    setStorageName,
  };
};
