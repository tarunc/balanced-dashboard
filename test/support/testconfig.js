document.write('<script src="https:\/\/js.balancedpayments.com\/1.1\/balanced.js"><\/script>');

QUnit.config.testTimeout = 30000;

$('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 600px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>').appendTo('head');
$('<div id="ember-testing-container"><div id="balanced-app"></div></div>').appendTo(document.body);

var _sinon = sinon;

QUnit.begin(function() {
	console.log('Testing starting.');

	// Display an error if asynchronous operations are queued outside of
	// Ember.run.  You need this if you want to stay sane.
	Ember.testing = true;

	Ember.run(function() {
		Balanced.THROTTLE = 0;
		Balanced.setupForTesting();
	});

	Ember.run(function() {
		window.Balanced.advanceReadiness();
	});

	Balanced.injectTestHelpers();

	window.Balanced.onLoad();
	// turn off ajax async
	$.ajaxSetup({
		async: false
	});
});

QUnit.testStart(function(test) {
	console.log('#%@ %@: starting up.'.fmt(test.module, test.name));

	// Reset the application
	Balanced.reset();
	sinon.restore();
	sinon = _sinon.sandbox.create();

	_.each(_sinon, function(val, key) {
		if (sinon[key]) {
			return;
		}

		sinon[key] = val;
	});

	// Register all the types again
	Balanced.register('user:main', null, {
		instantiate: false,
		singleton: true
	});

	Balanced.register('auth:main', Balanced.Auth, {
		instantiate: false,
		singleton: true
	});
});

QUnit.testDone(function(test) {
	console.log('#%@ %@: tearing down.'.fmt(test.module, test.name));

	Ember.run(function() {
		Balanced.Auth.signOut();
	});

	sinon.restore();
});
