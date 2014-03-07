Balanced.View = Ember.View.extend({
	didInsertElement: function() {
		this.set('elementInDom', true);
		this._super();

		this.$('form input[type=text]:first').focus();
		this.$('.selectable').on('click', $.proxy(this.selectText, this));
	},

	willDestroyElement: function() {
		this.set('elementInDom', false);
		this._super();
	},

	selectText: function(evt) {
		if (document.selection) {
			var range;

			if (document.body.createTextRange) {
				range = document.body.createTextRange();
			} else if (document.selection.createRange) {
				range = document.selection.createRange();
			}

			if (!range) {
				return;
			}

			range.moveToElementText(evt.target);
			range.select();
		} else if (window.getSelection) {
			var range = document.createRange();
			range.selectNode(evt.target);
			window.getSelection().addRange(range);
		}
	}
});
