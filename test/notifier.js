import sinon from 'sinon';
import {expect} from 'chai';

import createLogger from './../src/logger';
import PushBullet from 'pushbullet';
import {Notifier, transports as notifierTransports} from './../src/notifier';

let logger = createLogger('webhook', 'warn');

const getMockedPushBulletInstance = () => {
  let PushBulletStub = function () {};

  PushBulletStub.prototype = PushBullet.prototype;
  PushBulletStub.prototype.devices = (cb) => {
    cb(null, { devices: [{ iden: '1', active: true }, { iden: '2', active: true }] });
  };

  PushBulletStub.prototype.note = (deviceId, title, body, cb) => {
    cb(null, {});
  };

  return new PushBulletStub();
};

const getMockedNotifier = (devices) => {
  return new Notifier([
    new notifierTransports.PushBulletTransport(
      getMockedPushBulletInstance(),
      devices,
      logger
    ),
  ]);
};

describe('notifier', () => {
  describe('transport', () => {
    describe('Interface', () => {
      it('should throw an error if call new', () => {
        let isCaught = false;
        try {
          new notifierTransports.TransportInterface();
        } catch (e) {
          isCaught = true;
          expect(e).to.be.an.instanceof(TypeError)
            .with.property('message').that.match(/abstract/);
        }

        expect(isCaught).to.be.true;
      });

      it('should throw an error if call `send`', () => {
        let isCaught = false;
        try {
          class ExtendTransportInterface extends notifierTransports.TransportInterface {
          }
          let extendedClass = new ExtendTransportInterface();
          extendedClass.send();
        } catch (e) {
          isCaught = true;
          expect(e).to.be.an.instanceof(Error)
            .with.property('message').that.match(/not implemented/);
        }

        expect(isCaught).to.be.true;
      });
    });

    describe('PushBullet', () => {
      it('should throw error if service argument is not an instance of PushBullet', () => {
        let isCaught = false;
        try {
          new notifierTransports.PushBulletTransport(
              {},
              '1',
              logger
          );
        } catch (e) {
          isCaught = true;
          expect(e).to.be.an.instanceof(TypeError)
            .with.property('message').that.match(/PushBullet instance/);
        }

        expect(isCaught).to.be.true;
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
            null,
            logger
        );
        let promise = transport.send({ title: '', body: '' });
        promise.then(() => {
          done();
        });
      });

      it('should execute `note` method once', done => {
        let notifier = getMockedPushBulletInstance();
        let spy = sinon.spy(notifier, 'note');
        let transport = new notifierTransports.PushBulletTransport(
          notifier,
          '1',
          logger
        );
        transport.send({ title: '', body: '' })
            .then(() => {
              expect(spy.called).to.be.true;
              done();
            })
            .catch(err => {
              done(err);
            });

      });

      it('should execute `note` for each message on each device', (done) => {
        let service = getMockedPushBulletInstance();
        let spy = sinon.spy(service, 'note');
        let devices = ['1', '2'];
        let messages = [
          { title: 'first', body: 'first' },
          { title: 'second', body: 'second' },
          { title: 'third', body: 'third' },
        ];
        let transport = new notifierTransports.PushBulletTransport(
          service,
          devices,
          logger
        );
        let sendPromises = [];
        messages.forEach(message => {
          sendPromises.push(transport.send(message));
        });
        Promise.all(sendPromises)
          .then(() => {
            expect(spy.callCount).to.equal(messages.length * devices.length);
            done();
          })
          .catch(err => {
            done(err);
          });
      });

      it('should call subscribers on construct', (done) => {
        new notifierTransports.PushBulletTransport(
          getMockedPushBulletInstance(),
          null,
          logger,
          () => {
            done();
          }
        );
      });

      it('should write to log error on `devices` reject', (done) => {
        let service = getMockedPushBulletInstance();
        let errorText = 'devices error response';
        sinon.stub(service, 'devices', (cb) => {
          cb(errorText, null);
        });
        let loggerMock = sinon.mock(logger);
        loggerMock.expects('error').once();
        new notifierTransports.PushBulletTransport(
          service,
          null,
          logger,
          () => {
            loggerMock.restore();
            loggerMock.verify();
            done();
          }
        );
      });

      it('should write to log error on `note` reject', (done) => {
        let service = getMockedPushBulletInstance();
        let errorText = 'devices error response';
        sinon.stub(service, 'note', (deviceId, title, body, cb) => {
          cb(errorText, null);
        });
        let loggerMock = sinon.mock(logger);
        loggerMock.expects('error').once();
        let transport = new notifierTransports.PushBulletTransport(
          service,
          ['1'],
          logger
        );
        transport.send({})
          .catch(err => {
            loggerMock.restore();
            loggerMock.verify();
            expect(err).to.be.string(errorText);
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
      let isCaught = false;
      try {
        new Notifier([{}]);
      } catch (e) {
        isCaught = true;
        expect(e).to.be.an.instanceof(TypeError)
          .with.property('message').that.match(/not implement/);
      }

      expect(isCaught).to.be.true;
    });
  });

  it('should return resolved promise without transports', (done) => {
    let notifier = getMockedNotifier();
    notifier.transports = [];
    notifier.notify({})
        .then(() => {
          done();
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
    let message = { title: 'title', body: 'body' };
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
    let message = { title: 'title', body: 'body' };
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
