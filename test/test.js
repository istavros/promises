var chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	Vow = require('../vow'),
	should = chai.should();

chai.use(chaiAsPromised);

describe('vow', function() {

	var p = new Vow(function(fulfill, reject) {
		setTimeout(function() {
			fulfill(1);
		}, 1);
	});

	it('fulfilled with value 1', function() {
		return p.should.become(1);
	});

	it('fulfilled with value 2', function() {
		return p.then(function(value) {
			return value + 1;
		}).should.become(2);
	});

});