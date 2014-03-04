Balanced.Forms = {
	TextField: Ember.TextField.extend({
		attributeBindings: ['autocomplete', 'placeholder', 'autofocus']
	})
};

Ember.LinkView.reopen({
	attributeBindings: ['href', 'title', 'rel', 'data-evt'],
	'data-evt': null
});
