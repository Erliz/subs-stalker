import {EventEmitter2} from 'eventemitter2';

//class SubsEventEmitter extends EventEmitter2{}

export default new EventEmitter2({
  wildcard: false,
  delimiter: ':',
  newListener: false,
});
