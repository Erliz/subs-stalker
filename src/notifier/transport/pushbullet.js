import TransportInterface from './interface';
import PushBullet from 'pushbullet';

export default class PushBulletTransport extends TransportInterface
{
    /**
     * @param {PushBullet} service
     * @param {String} devices
     * @param logger
     * @param {Function} callback
     */
    constructor(service, devices, logger, callback = () => {}) {
        if (!(service.constructor == PushBullet)) {
            throw new TypeError('Service for PushBulletTransport expects to be PushBullet instance');
        }
        super(service, [], logger);
        devices = Array.isArray(devices) ? devices : [devices];

        this.whenInitialize = this.getDevicesList()
            .then(res => {
                this.devices = this.getAvailableDevices(devices, res);
                callback(null, true);
            })
            .catch(err => {
                this.logger.error(err.message);
                callback(err);
            });
    }

    /**
     * @param sendToDevices
     * @param {Array} devices
     *
     * @returns {Array}
     */
    getAvailableDevices(sendToDevices, {devices = []}) {
        let availableDevices = [];
        devices.forEach((device) => {
            if (device.active && sendToDevices.indexOf(device.iden) > -1) {
                availableDevices.push(device.iden);
            }
        });

        return availableDevices;
    }

    /**
     * @returns {Promise}
     */
    getDevicesList() {
        return new Promise((resolve, reject) => {
            this.service.devices((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }

    /**
     * @param title
     * @param body
     *
     * @returns {Promise}
     */
    sendToDevices({title = '', body = ''}) {
        let notifications = [];
        this.devices.forEach((deviceId) => {
            this.logger.info(`send message "${title}": "${body}" to device id ${deviceId}`);
            notifications.push(new Promise((resolve, reject) => {
                this.service.note(deviceId, title, body, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
            }));
        });

        if (!notifications.length) {
            notifications.push(Promise.resolve());
        }
        return Promise.race(notifications);
    }

    /**
     * @param message
     * @returns {Promise}
     */
    send(message) {
        return this.whenInitialize
            .then(() => this.sendToDevices(message))
            .catch(err => {
                this.logger.error(err.message);
                throw err;
            });
    }
}
