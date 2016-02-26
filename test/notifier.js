import assert from 'assert';
import sinon from 'sinon';

import PushBullet from 'pushbullet';
import notifier from './../src/notifier';

describe.skip('notifier', () => {
    beforeEach(() => {
         sinon.spy(PushBullet);
    });
    afterEach(() => {
        PushBullet.restore();
    });
    describe('init', () => {

        it('should create instance with specify api key', () => {
            notifier.init('1234');
        });

    });
});
