export default class Transport {
    constructor(service, devices, logger = console) {
        if (!(this instanceof Transport)) {
            throw TypeError('Transport is an abstract class');
        }
        this.logger = logger;
        this.service = service;

        devices = Array.isArray(devices) ? devices : [devices];
        this.devices = devices;
    }

    send(title, message) {
        throw new Error('Method not implemented');
    }
}
