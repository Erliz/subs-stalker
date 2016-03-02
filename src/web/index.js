import express from 'express';
import bodyParser from 'body-parser';
const http = express();
let eventEmitter;
let logger = console;
let server;

http.use(bodyParser.json());
http.use(bodyParser.urlencoded({ extended: true }));

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

const dispatch = (eventName, event) => {
  if (eventEmitter) {
    eventEmitter.emit(eventName, event);
  }
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

export default { run, stop, setEventEmitter, setLogger };
