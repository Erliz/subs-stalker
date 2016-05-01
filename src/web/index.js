import express from 'express';
import bodyParser from 'body-parser';
import Promise from 'bluebird';
const http = express();
let eventEmitter;
let logger = console;
let server;
let storage;

http.use(bodyParser.json());
http.use(bodyParser.urlencoded({ extended: true }));

http.get('/', function (req, res) {
  getList()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send(responseError(err));
    });
});

http.get('/remove/:id/', function (req, res) {
  remove(req.params.id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send(responseError(err));
    });
});

const responseError = (err) => {
  return {error: err.toString()}
};

http.post('/', function (req, res) {
  if (req.body) {
    let params = req.body;
    logger.info('Receive: ' + JSON.stringify(params));
    if (params.EventType) {
      switch (params.EventType) {
        case 'Test':
          dispatch('subs:test', params);
          break;
        case 'Download':
        case 'Rename':
          dispatch('subs:webhook:request', params);
          break;
        default:
          logger.error('Webhook receive request with not mapped params:', params);
      }
    }
  }

  res.send('{data: "ok"}');
});

const setEventEmitter = (emitter) => {
  eventEmitter = emitter;
};

const setLogger = (log) => {
  logger = log;
};

const setStorage = (st) => {
  storage = st;
};

const dispatch = (eventName, event) => {
  if (eventEmitter) {
    eventEmitter.emit(eventName, event);
  }
};

const getList = () => {
  return new Promise((resolve, reject) => {
    storage.list((err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

const remove = (id) => {
  return getList()
    .then(list => {
      let episodes = list.filter(episode => {
        if (episode.id == id) {
          logger.info(`Find episode to remove`);
          return episode;
        }
      });
      if (episodes.length) {
        return episodes[0];
      } else {
        throw new Error(`Not found episode with id ${id}`);
      }
    })
    .then(episode => {
      return new Promise((resolve, reject) => {
        storage.remove(episode, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      });
    });
};

const run = (ip = 'localhost', port = 3000) => {
  return new Promise((resolve) => {
    server = http.listen(port, () => {
      logger.info(`Subs-Stalker webhook listener running at http://${ip}:${port}/`);
      resolve();
    });
  });
};

const stop = () => {
  return new Promise((resolve) => {
    server.close(() => {
      logger.info(`Subs-Stalker webhook listener stopped`);
      resolve();
    });
  });
};

export default { run, stop, setEventEmitter, setLogger, setStorage };
