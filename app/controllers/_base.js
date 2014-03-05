Balanced.ObjectController = Ember.ObjectController.extend({
	emit: function(name, data, fromWhere) {
		if (!fromWhere) {
			fromWhere = this.constructor.toString();
		}

		this.send('emit', name, data, fromWhere);
	}
});

Balanced.ArrayController = Ember.ArrayController.extend({
	emit: function() {
		if (!fromWhere) {
			fromWhere = this.constructor.toString();
		}

		this.send('emit', name, data, fromWhere);
	}
});
