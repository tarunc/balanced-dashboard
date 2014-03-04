Balanced.ForgotPasswordRoute = Balanced.Route.extend({
	pageTitle: 'Forgot password',

	setupController: function(controller, model) {
		controller.setProperties({
			submitted: false,
			hasError: false
		});

		this._super(controller, model.fp);
	},

	model: function() {
		var fp = Balanced.ForgotPassword.create();

		return {
			fp: fp
		};
	}
});
