var chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
    vow = require('../vow'),
	should = chai.should(),
	Promise = vow.Promise;

chai.use(chaiAsPromised);

describe('promise', function(){

	var p = new Promise(function (fulfill, reject) {
		fulfill(1);
	});

	it('fulfilled with value 1',function(){
		return p.should.become(1);
	});	

});