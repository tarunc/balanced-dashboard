Balanced.LogsIndexController = Balanced.ObjectController.extend(Ember.Evented, Balanced.ResultsTable, {
	needs: ['marketplace'],

	sortField: 'created_at',
	sortOrder: 'desc',
	results_type: 'Balanced.Log',
	type: null,
	limit: 20,
	endpoint: null,
	status_rollup: null,

	baseClassSelector: '#logs',

	currentEndpointFilter: null,
	statusRollupFilterSucceeded: true,
	statusRollupFilterFailed: true,

	actions: {
		setEndPointFilter: function(endpoint) {
			if (endpoint) {
				this.set('currentEndpointFilter', Balanced.Utils.toTitleCase(endpoint));
				this.set('endpoint', endpoint);
			} else {
				this.set('currentEndpointFilter', null);
				this.set('endpoint', null);
			}
		}
	},

	results_base_uri: function() {
		return Balanced.Log.create().get('uri');
	}.property(),

	trackFilters: function() {
		var succeeded = this.get('statusRollupFilterSucceeded'),
			failed = this.get('statusRollupFilterFailed');

		Balanced.Analytics.trackEvent('Logs-Table-Request-Filter', {
			succeeded: succeeded,
			failed: failed
		});

		if (failed && succeeded) {
			Balanced.Analytics.trackEvent('Logs-Table-Request-Filter-Both-Checked');
		} else {
			Balanced.Analytics.trackEvent('Logs-Table-Request-Filter-One-Checked', {
				succeeded: succeeded,
				failed: failed
			});
		}
	}.property('statusRollupFilterSucceeded', 'statusRollupFilterFailed'),

	extra_filtering_params: function() {
		var params = {
			'method[in]': 'post,put,delete'
		};

		var endpoint = this.get('endpoint');
		if (endpoint) {
			params.endpoint = endpoint;
		}

		var succeeded = this.get('statusRollupFilterSucceeded'),
			failed = this.get('statusRollupFilterFailed'),
			statusFilters = [];

		if (succeeded && !failed) {
			statusFilters.push('2xx');
		}
		if (failed && !succeeded) {
			statusFilters.push('3xx', '4xx', '5xx');
		}
		if (statusFilters.length > 0) {
			params['status_rollup[in]'] = statusFilters;
		}

		return params;
	}.property('endpoint', 'statusRollupFilterSucceeded', 'statusRollupFilterFailed')
});

Balanced.LogsLogController = Balanced.ObjectController.extend({
	needs: ['marketplace']
});
