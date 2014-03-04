Balanced.ModalActionButtonsView = Balanced.View.extend({
	templateName: 'modals/action_buttons',

	// override this to customize
	submitTitle: "Submit",

	// override to customize, adds "ing..." to submitTitle if not defined
	submittingTitle: null,

	isSubmitting: function() {
		return this.get('parentView.model.isSaving') || this.get('parentView.isSubmitting');
	}.property('parentView.isSubmitting', 'parentView.model.isSaving'),

	_submitTitle: function() {
		if (this.get('isSubmitting')) {
			var submittingTitle = this.get('submittingTitle');
			if (submittingTitle) {
				return submittingTitle;
			}
			return this.get('submitTitle') + 'ing...';
		}
		return this.get('submitTitle');
	}.property('submitTitle', 'submittingTitle', 'isSubmitting'),

	eventName: function() {
		var evtTitle = this.get('eventTitle');
		if (evtTitle) {
			evtTitle += '-' + this.get('submitTitle');
		} else {
			evtTitle = this.get('submitTitle');
		}

		return evtTitle;
	}.property('eventTitle', 'submitTitle'),

	cancelEventName: function() {
		var evtTitle = this.get('eventTitle');
		if (evtTitle) {
			evtTitle += '-Cancel';
		} else {
			evtTitle = this.get('submitTitle');
		}

		return evtTitle;
	}.property('eventTitle', 'submitTitle')
});
