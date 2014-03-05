window.mixpanel = window.mixpanel || [];
window._gaq = window._gaq || [];

Balanced.Analytics = (function() {
	if (!window.TESTING) {
		// This page will almost always be over https, so can just load this directly.
		$.getScript('https://ssl.google-analytics.com/ga.js', {
			cache: true
		});
	}

	// links the current id with this specific id

	function trackLogin(email) {
		try {
			window.mixpanel.identify(email);
			Raven.setUser({
				email: email
			});
		} catch (err) {}
	}

	var analytics = {
		init: function(settings) {
			if (window.TESTING || !window.mixpanel.init) {
				return;
			}

			window.mixpanel.init(settings.MIXPANEL);

			window._gaq.push(['_setAccount', settings.GOOGLE_ANALYTICS]);
			window._gaq.push(['_setDomainName', 'balancedpayments.com']);
			window._gaq.push(['_trackPageview']);

			Balanced.Auth.on('signInSuccess', function() {
				Balanced.Analytics.trackEvent('login-success', {
					remembered: false
				});

				var user = Balanced.Auth.get('user');
				trackLogin(user.get('email_address'));
			});

			Balanced.Auth.on('signInError', function() {
				Balanced.Analytics.trackEvent('login-error');
			});

			$(document).bind("ajaxComplete", function(evt, jqxhr, ajaxOptions) {
				if (jqxhr && jqxhr.status >= 400) {
					Balanced.Analytics.trackEvent('ajax-error', {
						status: jqxhr.status,
						ajaxUrl: ajaxOptions.url,
						type: ajaxOptions.type,
						responseText: jqxhr.responseText
					});
				}
			});

			// HACK: can't find an good way to track all events in ember atm
			// to track all click events
			$(document).on('click', 'a,.btn,button', function() {
				var e = $(this);
				// trims text contained in element
				var tt = e.prop('data-evt');
				if (!tt) {
					tt = e.text().replace(/^\s*([\S\s]*?)\s*$/, '$1');
				}

				Balanced.Analytics.trackClick(tt);
			});

			Balanced.__container__.lookup('router:main').on('event', function(data) {
				console.log('analytics', data);
			});
		},
		trackClick: function(name, data) {
			data = data || {};
			var eventName = 'click ' + name;

			Balanced.Analytics.trackEvent(eventName, _.extend({
				location: location.hash
			}, data));
		},
		trackPage: _.debounce(function(page) {
			var currentLocation = page + location.hash;
			if (window.TESTING || !window.mixpanel.track_pageview) {
				return;
			}
			window._gaq.push(['_trackPageview', currentLocation]);
			window.mixpanel.track_pageview(currentLocation);
		}, 500),
		trackEvent: function(name, data) {
			data = data || {};

			if (window.TESTING || !window.mixpanel.track) {
				return;
			}

			if (Balanced.currentMarketplace) {
				data.marketplaceId = Balanced.currentMarketplace.get('id');
				data.marketplaceName = Balanced.currentMarketplace.get('name');
				data.marketplaceIsProduction = Balanced.currentMarketplace.get('production');
			}

			if (Balanced.Auth.get('user')) {
				data.signedIn = true;
				data.isAdmin = Balanced.Auth.get('user.admin');
			}

			var filteredData = Balanced.Utils.filterSensitivePropertiesMap(data);
			window.mixpanel.track(name, filteredData);
			window._gaq.push(['_trackEvent', 'dashboard', name]);
		}
	};

	return analytics;
})();
