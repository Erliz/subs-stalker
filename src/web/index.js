import express from 'express';
import bodyParser from 'body-parser';
let http = express();
let eventEmitter;

http.use(bodyParser.json());
http.use(bodyParser.urlencoded({ extended: true }));

http.post('/', function (req, res) {
    if (req.body) {
        let params = req.body;
        if (params.EventType) {
            switch (params.EventType) {
                case 'Test':
                    emit('subs:test', params);
                    break;
                case 'Download':
                case 'Rename':
                    emit('subs:webhook:request', params);
                    break;
                default:
                    console.log('Webhook receive request with not mapped params:');
                    console.log(params);
            }
        }
    }
    res.send('{data: "ok"}');
});

function setEventEmitter(emitter) {
    eventEmitter = emitter;
}

function emit(eventName, event) {
    if (eventEmitter) {
        eventEmitter.emit(eventName, event);
    }
}

function run(ip = 'localhost', port = 3000) {
    http.listen(port, function () {
        console.log('Example app listening on port 3000!');
    });
    console.log(`Subs-Stalker webhook listener running at http://${ip}:${port}/`);
}

export default {run, setEventEmitter};
