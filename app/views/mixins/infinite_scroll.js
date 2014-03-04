Balanced.InfiniteScrollViewMixin = Ember.Mixin.create({
	outerContainerSelector: window,
	innerContainerSelector: '.inf-scroll-inner-container',

	didInsertElement: function() {
		this.setupInfiniteScrollListener();
		this._super();
	},

	willDestroyElement: function() {
		this.teardownInfiniteScrollListener();
		this._super();
	},

	setupInfiniteScrollListener: function() {
		var $outerContainer = $(this.get('outerContainerSelector'));
		this.set('$outerContainer', $outerContainer);

		$outerContainer.on('scroll', $.proxy(this.didScroll, this));
	},

	teardownInfiniteScrollListener: function() {
		this.get('$outerContainer').off('scroll', $.proxy(this.didScroll, this));
	},

	didScroll: _.debounce(function() {
		if (this.get('controller.hasMore') && this.isScrolledToBottom()) {
			this.get('controller').send('loadMore');
		}
	}, 50, true),

	isScrolledToBottom: function() {
		var $outerContainer = this.get('$outerContainer');
		var distanceToViewportTop = ($(this.get('innerContainerSelector')).height() - $outerContainer.height());
		var viewPortTop = $outerContainer.scrollTop();

		if (viewPortTop === 0) {
			// if we are at the top of the page, don't do
			// the infinite scroll thing
			return false;
		}

		return (viewPortTop >= distanceToViewportTop);
	}
});
