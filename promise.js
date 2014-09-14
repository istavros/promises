// Promise By Stavros Ioannidis

function Promise(fn) {
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
		return new Promise(function(fulfill, reject) {
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

		if (newValue instanceof Promise) {
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
