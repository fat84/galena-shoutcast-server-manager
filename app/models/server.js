import ModelHelper from '../../lib/utils/model-helper';

export default class ServerViewModel {

    constructor(data) {
        let defaults = {
            id:  '',
            name: '',
            portBase: 0,
            password: '',
            adminPassword: '',
            maxusers: 0,
            public: true,
            isRunning: false,
            state: null
        };

        ModelHelper.AssignObjectData(this, defaults, data);
    }
}
