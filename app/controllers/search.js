var Computed = {
	isCategory: function(category) {
		return Ember.computed.equal('category', category);
	}
};

Balanced.SearchController = Balanced.ObjectController.extend(
	Balanced.ResultsTable, {
		needs: ['application', 'marketplace'],

		type: 'search',
		search: null,
		debounced_search: null,

		allowSortByNone: true,

		showResults: false,

		baseClassSelector: '#search',

		transactionTypeFilter: false,

		init: function() {
			this._super();

			var self = this;
			var debouncedQuery = _.debounce(function() {
				// since this might get called after a timeout, make sure this
				// object is still valid (especially necessary for tests)
				if (!self.get('isDestroyed')) {
					self.runQuery();
				}
			}, Balanced.THROTTLE.SEARCH);
			this.addObserver('search', Balanced.THROTTLE.SEARCH > 0 ? debouncedQuery : _.bind(this.runQuery, this));
		},

		actions: {
			openSearch: function() {
				this.set('showResults', true);
			},

			closeSearch: function() {
				this.set('showResults', false);
			},

			clearSearch: function() {
				this.reset();
			},

			query: function() {
				var search = this.get('search');
				if (!search || search.length === 0) {
					this.reset();
					return;
				}

				if (search.indexOf('OHM') === 0 && search.length > 30) {
					this.redirectToLog(search);
					return;
				}

				this.set('debounced_search', this.get('search'));
				this.set('showResults', true);
			}
		},

		fetch_results: function() {
			return this.get('debounced_search') && this.get('debounced_search').length > 0;
		}.property('debounced_search'),

		updateResultsIfErrored: function() {
			var results = this.get('results');
			if (results && results.get('isError') && this.get('fetch_results')) {
				this.set('debounced_search', '');
			}
		}.observes('results', 'results.isError'),

		extra_filtering_params: function() {
			var query = this.get('debounced_search');

			if (query) {
				Balanced.Analytics.trackEvent('Search', {
					query: query
				});
			}

			if (query === '%') {
				query = '';
			}

			return {
				query: query
			};
		}.property('debounced_search'),

		runQuery: function() {
			this.send('query');
		},

		reset: function() {
			this.setProperties({
				debounced_search: null,
				search: null,
				minDate: null,
				maxDate: null,
				dateFilterTitle: 'Any time',
				sortField: null,
				sortOrder: null,
				type: 'search',
				last_loaded_search_result: null
			});
		},

		displayResults: function() {
			return this.get('fetch_results') && this.get('showResults');
		}.property('fetch_results', 'showResults'),

		redirectToLog: function(ohm) {
			var self = this;

			var logUri = Balanced.Log.constructUri(ohm);
			Balanced.Log.find(logUri).then(function(log) {
				self.send('closeSearch');
				self.transitionToRoute('logs.log', log);
			});
		},

		// UI properties
		ordersTabSelected: Computed.isCategory('order'),
		transactionsTabSelected: Computed.isCategory('search'),
		customersTabSelected: Computed.isCategory('customer'),
		fundingInstrumentsTabSelected: Computed.isCategory('funding_instrument'),
		disputesTabSelected: Computed.isCategory('dispute')
	}
);
