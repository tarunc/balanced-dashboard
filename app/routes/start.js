Balanced.StartRoute = Balanced.Route.extend({
	pageTitle: 'Getting started',

	model: function() {
		if (Balanced.Auth.get('signedIn')) {
			return Balanced.currentMarketplace;
		} else {
			return Balanced.Auth.createNewGuestUser().then(function(apiKey) {
				var apiKeySecret = apiKey.get('secret');
				var settings = {
					headers: {
						Authorization: Balanced.Utils.encodeAuthorization(apiKeySecret)
					}
				};
				return Balanced.Marketplace.create().save(settings).then(function(marketplace) {
					marketplace.populateWithTestTransactions();

					Balanced.Auth.setupGuestUserMarketplace(marketplace);

					return marketplace;
				});
			});
		}
	},
	redirect: function() {
		if (Balanced.Auth.get('user') && !Balanced.Auth.get('isGuest')) {
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
			Balanced.Auth.forgetLogin();
			this.transitionTo('login');
		}
	}
});
