import validator from 'validator';
import ModelHelper from '../utils/model-helper';

export default class Server {
  constructor(data) {
    let defaults = {
      id: '',
      name: '',
      portBase: 0,
      password: '',
      adminPassword: '',
      maxusers: 0,
      public: true
    };

    ModelHelper.AssignObjectData(this, defaults, data);
  }

  validate() {
    let result = {};

    if (validator.isEmpty(this.name)) {
      result['name'] = 'Name is required';
    }

    if (!validator.isInt(this.portBase.toString(), { min: 8000, max: 65534})
        || (this.portBase % 2 != 0)) {
      result['portBase'] = 'Invalid port base';
    }

    if (validator.isEmpty(this.password)) {
      result['password'] = 'Password is required';
    }

    if (validator.isEmpty(this.adminPassword)) {
      result['adminPassword'] = 'Admin password is required';
    }

    if (!validator.isInt(this.maxusers.toString(), { min: 1, max: 65534})) {
      result['maxusers'] = 'Invalid max users';
    }

    return Object.getOwnPropertyNames(result).length === 0 ? false : result;
  }
}
