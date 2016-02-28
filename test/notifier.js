import assert from 'assert';
import sinon from 'sinon';
import {expect} from 'chai';

import createLogger from './../src/logger';
import PushBullet from 'pushbullet';
import {Notifier, transports as notifierTransports} from './../src/notifier';

let logger = createLogger('webhook', 'warn');

const getMockedPushBulletInstance = () => {
    let PushBulletStub = function(){};
    PushBulletStub.prototype = PushBullet.prototype;
    PushBulletStub.prototype.devices = (cb) => {
        cb(null, {devices: [{iden: '1', active: true}, {iden: '2', active: true}]});
    };
    PushBulletStub.prototype.note = (deviceId, title, body, cb) => {
        cb(null, {});
    };
    return new PushBulletStub();
};

const getMockedNotifier = (devices) => {
    return new Notifier([new notifierTransports.PushBulletTransport(
        getMockedPushBulletInstance(),
        devices,
        logger
    )]);
};

describe('notifier', () => {

    describe('transport', () => {

        describe('Interface', () => {

            it('should throw an error if call new', () => {
                try {
                    new notifierTransports.TransportInterface();
                } catch (e) {
                    expect(e).to.be.an.instanceof(TypeError).with.property('message').that.match(/abstract/);
                }
            });

            it('should throw an error if call `send`', () => {
                try {
                    class ExtendTransportInterface extends notifierTransports.TransportInterface {}
                    let extendedClass = new ExtendTransportInterface();
                    extendedClass.send();
                } catch (e) {
                    expect(e).to.be.an.instanceof(Error).with.property('message').that.match(/not implemented/);
                }
            });
        });

        describe('PushBullet', () => {

            it('should throw error if service argument is not an instance of PushBullet', () => {
                try {
                    new notifierTransports.PushBulletTransport(
                        {},
                        '1',
                        logger
                    );
                } catch (e) {
                    expect(e).to.be.an.instanceof(TypeError).with.property('message').that.match(/PushBullet instance/);
                }
            });

            it('should create transport instance successfully', () => {
                let notifier = getMockedPushBulletInstance();
                let pbMock = sinon.mock(notifier);
                pbMock.expects('devices').once();
                new notifierTransports.PushBulletTransport(notifier, [], logger);
                pbMock.verify();
            });

            it('should return resolvable promise with empty devices list', (done) => {
                let service = getMockedPushBulletInstance();
                let transport = new notifierTransports.PushBulletTransport(
                    service,
                    [],
                    logger
                );
                let promise = transport.send({title: '', body: ''});
                promise.then(() => {
                    done();
                })
            });

            it('should execute `note` method once', done => {
                let notifier = getMockedPushBulletInstance();
                let spy = sinon.spy(notifier, 'note');
                let transport = new notifierTransports.PushBulletTransport(
                    notifier,
                    '1',
                    logger
                );
                transport.send({title: '', body: ''})
                    .then((res, err) => {
                        if (err) {
                            done(err);
                        }
                        expect(spy.called).to.be.true;
                        done();
                    })
                    .catch(err => {
                        done(err);
                    });

            });

            it('should execute `note` for each message on each device', (done) => {
                let notifier = getMockedPushBulletInstance();
                let spy = sinon.spy(notifier, 'note');
                let devices = ['1', '2'];
                let messages = [
                    {title: 'first', body: 'first'},
                    {title: 'second', body: 'second'},
                    {title: 'third', body: 'third'}
                ];
                let transport = new notifierTransports.PushBulletTransport(
                    notifier,
                    devices,
                    logger
                );
                let sendPromises = [];
                messages.forEach(message => {
                    sendPromises.push(transport.send(message));
                });
                Promise.all(sendPromises)
                    .then((res, err) => {
                        expect(err).to.not.exist;
                        expect(spy.callCount).to.equal(messages.length * devices.length);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    });
            });

        });
    });

    describe('constructor', () => {

        it('should successfully create instance', () => {
            let notifier = getMockedNotifier();
            expect(notifier).to.be.an.instanceof(Notifier);
        });

        it('should throw an error if get instance that not implement transport interface', () => {
            try {
                new Notifier([{}])
            } catch (e) {
                expect(e).to.be.an.instanceof(TypeError).with.property('message').that.match(/not implement/);
            }
        });

    });

    it('should send message to transport', (done) => {
        let transport = new notifierTransports.PushBulletTransport(
            getMockedPushBulletInstance(),
            '',
            logger
        );
        let notifier = new Notifier([transport]);
        let sendSpy = sinon.spy(transport, 'send');
        let message = {title: 'title', body: 'body'};
        notifier.notify(message)
            .then(() => {
                expect(sendSpy.alwaysCalledWithExactly(message)).to.be.true;
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should add title before each message title', (done) => {
        let transport = new notifierTransports.PushBulletTransport(
            getMockedPushBulletInstance(),
            '',
            logger
        );
        let notifierTitle = 'prefix_';
        let notifier = new Notifier([transport], notifierTitle);
        let sendSpy = sinon.spy(transport, 'send');
        let message = {title: 'title', body: 'body'};
        notifier.notify(message)
            .then(() => {
                expect(sendSpy.args[0][0].title).to.be.string(notifierTitle);
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});
