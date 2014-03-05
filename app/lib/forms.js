Balanced.Forms = {
	TextField: Ember.TextField.extend({
		attributeBindings: ['autocomplete', 'placeholder', 'autofocus']
	})
};

Ember.LinkView.reopen({
	attributeBindings: ['href', 'title', 'rel', 'data-evt'],
	'data-evt': null
});

var RESTRICTED_NAMES = ['emit', 'finalizeQueryParamChange', 'willTransition', 'didTransition'];

Ember.ActionHandler.reopen({
	willMergeMixin: function() {
		this._super.apply(this, arguments);
		if (!this._actions) {
			return;
		}

		var self = this;

		_.each(this._actions, function(fn, key) {
			if (RESTRICTED_NAMES.indexOf(key) >= 0) {
				return;
			}

			this._actions[key] = _.wrap(fn, function() {
				var arr = Array.prototype.slice.call(arguments);
				var func = arr.shift();

				this.send('emit', key, {
					arguments: arr
				}, this.constructor.toString());

				return func.apply(this, arr);
			});
		}, this);
	}
})
