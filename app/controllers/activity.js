Balanced.ActivityController = Balanced.ObjectController.extend(Balanced.ResultsTable, {
	needs: ['marketplace'],

	sortField: 'created_at',
	sortOrder: 'desc',
	limit: 50,

	baseClassSelector: '#activity',
	noDownloadsUri: true,

	refreshMarketplace: _.debounce(function() {
		if (!Balanced.currentMarketplace) {
			return;
		}

		Ember.run(function() {
			Balanced.currentMarketplace.reload();
		});
	}, 500),

	refresh: function() {
		this.refreshMarketplace();
	},

	actions: {
		changeTypeFilter: function(type) {
			Balanced.Analytics.trackEvent('Activity-Table-Filter', {
				type: type
			});

			this.set('type', type);
			if (type === 'search' || _.contains(Balanced.SEARCH.TRANSACTION_TYPES, type)) {
				this.transitionToRoute('activity.transactions');
			} else if (type === 'order') {
				this.transitionToRoute('activity.orders');
			} else if (type === 'customer') {
				this.transitionToRoute('activity.customers');
			} else if (type === 'funding_instrument' || _.contains(Balanced.SEARCH.FUNDING_INSTRUMENT_TYPES, type)) {
				this.transitionToRoute('activity.funding_instruments');
			} else if (type === 'dispute' || _.contains(Balanced.SEARCH.DISPUTE_TYPES, type)) {
				if (this.get('sortField') === 'created_at') {
					this.set('sortField', 'initiated_at');
				}

				this.transitionToRoute('activity.disputes');
			}

			this.refreshMarketplace();
		}
	},

	results_base_uri: function() {
		if (this.get('type') === 'dispute') {
			return '/disputes';
		}

		return this._super();
	}.property('type', 'controllers.marketplace.uri')
});

Balanced.NestedActivityResultsControllers = Balanced.ObjectController.extend({
	needs: ['marketplace', 'activity'],

	results: Ember.computed.alias('controllers.activity.results'),
	search_result: Ember.computed.alias('controllers.activity.search_result'),
	last_loaded_search_result: Ember.computed.alias('controllers.activity.last_loaded_search_result'),
	type: Ember.computed.alias('controllers.activity.type'),
	category: Ember.computed.alias('controllers.activity.category'),
	sortField: Ember.computed.alias('controllers.activity.sortField'),
	sortOrder: Ember.computed.alias('controllers.activity.sortOrder'),
	dateFilterTitle: Ember.computed.alias('controllers.activity.dateFilterTitle'),

	actions: {
		loadMore: function(results) {
			this.get('controllers.activity').send('loadMore', results);
		},

		changeSortOrder: function(field, sortOrder) {
			this.get('controllers.activity').send('changeSortOrder', field, sortOrder);
		}
	}
});

Balanced.ActivityTransactionsController = Balanced.NestedActivityResultsControllers.extend({
	allowSortByNone: false,
	noDownloadsUri: true
});

Balanced.ActivityDisputesController = Balanced.NestedActivityResultsControllers.extend({});

Balanced.ActivityOrdersController = Balanced.NestedActivityResultsControllers.extend({});

Balanced.ActivityCustomersController = Balanced.NestedActivityResultsControllers.extend({});

Balanced.ActivityFundingInstrumentsController = Balanced.NestedActivityResultsControllers.extend({});
