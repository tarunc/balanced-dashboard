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
		$(this.outerContainerSelector).on('scroll', $.proxy(this.didScroll, this));
	},

	teardownInfiniteScrollListener: function() {
		$(this.outerContainerSelector).off('scroll', $.proxy(this.didScroll, this));
	},

	didScroll: _.debounce(function() {
		if (this.get('controller.hasMore') && this.isScrolledToBottom()) {
			this.get('controller').send('loadMore');
		}
	}, 100),

	isScrolledToBottom: function() {
		var distanceToViewportTop = (
			$(this.innerContainerSelector).height() - $(this.outerContainerSelector).height());
		var viewPortTop = $(this.outerContainerSelector).scrollTop();

		if (viewPortTop === 0) {
			// if we are at the top of the page, don't do
			// the infinite scroll thing
			return false;
		}

		return (viewPortTop >= distanceToViewportTop);
	}
});
