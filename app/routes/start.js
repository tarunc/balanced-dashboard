Balanced.StartRoute = Balanced.Route.extend({
	pageTitle: 'Getting started',

	model: function() {
		if (this.get('auth.signedIn')) {
			return Balanced.currentMarketplace;
		} else {
			var auth = this.get('auth');

			return auth.createNewGuestUser().then(function(apiKey) {
				var apiKeySecret = apiKey.get('secret');
				var settings = {
					headers: {
						Authorization: Balanced.Utils.encodeAuthorization(apiKeySecret)
					}
				};
				return Balanced.Marketplace.create().save(settings).then(function(marketplace) {
					marketplace.populateWithTestTransactions();

					auth.setupGuestUserMarketplace(marketplace);

					return marketplace;
				});
			});
		}
	},
	redirect: function() {
		if (this.get('user') && !this.get('auth.isGuest')) {
			this.transitionTo('index');
		}
	},
	actions: {
		goToDashboard: function() {
			Balanced.Analytics.trackClick('Start-Page-Demo-Dashboard');
			this.transitionTo('activity', this.currentModel);
		},
		goToDocumentation: function() {
			Balanced.Analytics.trackClick('Start-Page-Docs');
			window.location = 'https://docs.balancedpayments.com';
		},
		goToApply: function() {
			Balanced.Analytics.trackClick('Start-Page-Apply-Production');
			this.transitionTo('marketplaces.apply');
		},
		goToLogin: function() {
			// Since we already logged them in as guest, log them out so they can sign in as themselves
			Balanced.Analytics.trackClick('Start-Page-Login');
			this.get('auth').forgetLogin();
			this.transitionTo('login');
		}
	}
});
