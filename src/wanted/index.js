import createStorage from '../storage';

export default (
  { logger = console, storageName = 'wanted', storagePath = 'storage.db' },
  callback = () => {}
) => {

  const  handleInitCallback = (err) => {
    if (err) throw err;
    storage.createTable('wanted', callback);
  };

  let tasks = [];
  let storage = createStorage({ logger, dbLocation: storagePath }, handleInitCallback);

  // get all wanted episodes episodes from storage
  const list = (callback) => {
    storage.findAll(storageName, callback);
  };

  // is episode already in storage
  const contains = (episode, callback = () => {}) => {
    list((err, episodesList) => {
      if (err) {
        callback(err, null);
      }

      callback(null, episodesList.some((inStorageEpisode) => {
        return inStorageEpisode.tvdbId === episode.tvdbId &&
          inStorageEpisode.episodeNum === episode.episodeNum &&
          inStorageEpisode.seasonNum === episode.seasonNum;
      }));
    });
  };

  // add episode to storage
  const add = (episode, callback = () => {}) => {
    contains(episode, (err, isExist) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!isExist) {
        storage.persist(storageName, episode, (err) => {
          if (err) {
            callback(err, null);
            return;
          }

          logger.info(
            `Added to wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`
          );
          callback(null, episode);
        });
      } else {
        let errorText =
          `Already wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`;
        logger.info(errorText);
        callback(new Error(errorText), episode);
      }
    });
  };

  // remove episode from storage
  const remove = (episode, callback = () => {}) => {
    contains(episode, (err, isExist) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (isExist) {
        storage.remove(storageName, episode, (err) => {
          if (err) {
            callback(err, null);
            return;
          }

          logger.info(
            `Remove from wanted subtitles for ${episode.seriesTitle} ep ${episode.episodeNum}`
          );
          callback(null, episode);
        });
      } else {
        let errorText =
          `No subtitles in wanted to remove for ${episode.seriesTitle} ep ${episode.episodeNum}`;
        logger.info(errorText);
        callback(new Error(errorText), episode);
      }
    });
  };

  /**
   * watcher for not downloaded subtitles
   * @param downloader instance
   */
  const watch = (downloader) => {
    list((err, list) => {
      if (err) throw err;
      logger.info(`Currently wanted ${list.length} subtitles`);
      list.forEach((episode, i) => {
        // anti ddos
        tasks.push(setTimeout(() => {
          downloader.download(episode);
        }, i * 10 * 1000));
      });
    });
    tasks.push(setTimeout(() => {
      watch(downloader);
    }, 10 * 60 * 1000));
  };

  /**
   * Destroy all watcher tasks and disconnect from db
   * @param callback
   */
  const destroy = (callback) => {
    tasks.forEach((taskId) => {
      clearTimeout(taskId);
    });
    storage.close(callback);
  };

  return {
    add,
    contains,
    remove,
    watch,
    destroy,
  };
};
