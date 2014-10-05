/*
The MIT License (MIT)

Copyright (c) 2014 Stavros Ioannidis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = factory();
	} else {
		// Browser globals
		root.Vow = factory();
	}
}(this, function() {
	function Vow(fn) {
		var self = this,
			value = null,
			reason = null,
			states = {
				PENDING: 'pending',
				FULFILLED: 'fulfilled',
				REJECTED: 'rejected'
			},
			state = states.PENDING,
			cb = [];

		self.then = function(onFulfilled, onRejected) {
			// 2.2.7
			return new self.constructor(function(fulfill, reject) {
				coordinate({
					onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null, // 2.2.1.1
					onRejected: typeof onRejected === 'function' ? onRejected : null, // 2.2.1.2
					fulfill: fulfill,
					reject: reject
				});
			});
		};

		function fulfill(newValue) {
			if (state !== states.PENDING) return; // 2.2.2.3

			if (self === value) {
				reject(new TypeError('Cannot fulfill Promise with itself!'));
				return;
			}

			if (newValue instanceof self.constructor) {
				newValue.then(function(newValue) {
					fulfill(newValue);
				}, function(newReason) {
					reject(newReason);
				});
				return;
			}

			if (typeof newValue === 'object' || typeof newValue === 'function') {
				var then;
				try {
					then = newValue.then;
				} catch (e) {
					reject(e);
					return;
				}
				if (typeof then === 'function') {
					var hasBeenCalled = false;
					try {
						then.call(newValue, function(y) {
							if (hasBeenCalled) return;
							hasBeenCalled = true;
							fulfill(y);
						}, function(r) {
							if (hasBeenCalled) return;
							hasBeenCalled = true;
							reject(r);
						});
					} catch (e) {
						if (!hasBeenCalled) reject(e);
					}
					return;
				}

			}

			state = states.FULFILLED;
			value = newValue;

			setTimeout(function() {
				while (cb.length)
					coordinate(cb.shift());
			}, 1);
		}

		function reject(newReason) {
			if (state !== states.PENDING) return; // 2.2.3.3
			state = states.REJECTED;
			reason = newReason;

			setTimeout(function() {
				while (cb.length)
					coordinate(cb.shift());
			}, 1);
		}

		function coordinate(handler) {
			if (state === states.PENDING) {
				cb.push(handler);
				return;
			}
			setTimeout(function() {
				var res;

				// 2.2.2.2
				if (state === states.FULFILLED) {
					// 2.2.1.1
					if (handler.onFulfilled) {
						try {
							// 2.2.2.1
							res = handler.onFulfilled(value);
						} catch (e) {
							handler.reject(e);
							return;
						}
						handler.fulfill(res);
						return;
					}
					handler.fulfill(value);
					return;
				}

				// 2.2.1.2
				if (handler.onRejected) {
					try {
						res = handler.onRejected(reason);
					} catch (e) {
						handler.reject(e);
						return;
					}
					handler.fulfill(res);
					return;
				}
				handler.reject(reason);
			}, 1);
		}

		fn(fulfill, reject);
	}

	return Vow;
}));