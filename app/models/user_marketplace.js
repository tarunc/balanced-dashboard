Balanced.UserMarketplace = Balanced.Model.extend({
	production: function() {
		return this.get('uri').indexOf('TEST') === -1;
	}.property('uri'),

	marketplace: function() {
		return Balanced.Marketplace.find(this.get('uri'));
	}.property('uri'),

	isEqual: function(a, b) {
		b = b || this;
		return Ember.get(a, 'secret') === Ember.get(b, 'secret');
	},

	updateSecret: function(newSecret) {
		this.set('secret', newSecret);
	}
});

Balanced.TypeMappings.addTypeMapping('user_marketplace', 'Balanced.UserMarketplace');

Balanced.Adapter.registerHostForType(Balanced.UserMarketplace, ENV.BALANCED.AUTH);

Balanced.UserMarketplace.reopenClass({
	serializer: Balanced.Rev0Serializer.create()
});
