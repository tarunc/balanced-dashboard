Balanced.ModalComponent = Ember.Component.extend({
	submitAction: 'submit',
	classNames: ['modal-container'],
	modalElement: '.modal',

	willDestroyElement: function() {
		this.hide();
	},

	hide: function() {
		this.$(this.get('modalElement')).modal('hide');
	},

	actions: {
		open: function(model) {
			var self = this;
			var modalElement = this.get('modalElement');
			Balanced.Analytics.trackEvent(this.get('name') + '-Open', {
				model: model && model.toJSON()
			});

			if (model) {
				model.on('didCreate', function() {
					self.$(modalElement).modal('hide');
				});

				this.set('model', model);
			}

			this.$(modalElement).modal({
				manager: this.$()
			});
		},

		close: function() {
			var modalElement = this.get('modalElement');
			this.$(modalElement).modal("hide");
		},

		save: function(model) {
			model = model || this.get('model');

			if (Ember.get(model, 'isSaving')) {
				return;
			}

			var self = this;

			model.save().then(function() {
				if (!self.get('submitAction')) {
					return;
				}

				self.sendAction('submitAction', model);
			});
		}
	}

});
