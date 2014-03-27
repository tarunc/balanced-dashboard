require('app/components/modal');

Balanced.UserDeleteModalComponent = Balanced.ModalComponent.extend({
	isSubmitting: false,
	hasError: false,

	actions: {
		confirm: function() {
			var self = this;

			this.setProperties({
				hasError: false,
				isSubmitting: true
			});

			this.get('user').delete().then(function() {
				self.setProperties({
					hasError: false,
					isSubmitting: false
				});

				self.hide();
			}, function() {
				self.setProperties({
					hasError: true,
					isSubmitting: false
				});
			});
		}
	}
});
