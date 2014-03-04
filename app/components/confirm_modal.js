require('app/components/modal');

Balanced.ConfirmModalComponent = Balanced.ModalComponent.extend({
	name: 'ConfirmModalComponent',

	reset: function() {
		this.off("cancel");
		this.off("confirm");
	},

	actions: {
		cancel: function() {
			this.trigger("cancel");
		},
		confirm: function() {
			this.trigger("confirm");
		}
	}
});
