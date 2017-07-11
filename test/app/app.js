import GalenaApp from '../../app/index';
import { expect } from 'chai';

describe('Server Manager App', function() {
    it('Can create instance', function() {
        var galenaApp = new GalenaApp();
        expect(galenaApp).to.be.an.instanceof(GalenaApp);
    })
});