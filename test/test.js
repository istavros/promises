var chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	Vow = require('../vow'),
	should = chai.should(),
	assert = chai.assert;

chai.use(chaiAsPromised);

describe('vow', function() {
	'use strict';
	var p = new Vow(function(fulfill, reject) {
		setTimeout(function() {
			fulfill(1);
		}, 1);
	});

	it('provides a "then" method. 2.2', function() {
		return assert.ok(typeof p.then === 'function');
	});

	it('"then" returns Vow object. 2.2.7', function() {
		return assert.strictEqual(p.then().constructor, Vow);
	});

	
	it('fulfilled with value 1', function() {
		return p.should.become(1);
	});

	it('onfulfilled returns a Vow object, which is fulfill with value 4', function() {
		return p.then(function(value) {
			return new Vow(function(fulfill, reject){
				setTimeout(function(){
					fulfill(4);
				},1);
			});
		}).should.become(4);
	});

});