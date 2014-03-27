var FORMAT_NUMBER_REGEX = /\B(?=(\d{3})+(?!\d))/g,
	PRETTY_LOG_URL_REGEX = /\/marketplaces\/[^\/]*\/(.+)$/,
	STRIP_DOMAIN_REGEX = /^.*\/\/[^\/]+/,
	TO_TITLECASE_REGEX = /\w\S*/g,
	UNDERSCORE_REPLACE_REGEX = /_/g,
	PARAM_HELPER_1_REGEX = /[\[]/,
	PARAM_HELPER_2_REGEX = /[\]]/,
	PARAM_URI_DECODE_REGEX = /\+/g,
	FORMAT_CURRENCY_REGEX = /(\d)(?=(\d{3})+\.)/g,
	FORMAT_ERROR_REGEX = /-\s/,
	REMOVE_COMMA_WHITESPACE_REGEX = /,|\s/g,
	CURRENCY_TEST_REGEX = /^([0-9]*(\.[0-9]{0,2})?)$/,
	HIDE_BA_NUMBER_REGEX = /([0-9])[\s+\-]([0-9])/g,
	HIDE_CC_NUMBER_REGEX = /([0-9]*)([0-9]{4})/g;


Balanced.Utils = Ember.Namespace.create({

	toDataUri: function(string) {
		return "data:text/plain;charset=utf-8;base64," + window.btoa(string);
	},

	stripDomain: function(url) {
		return url.replace(STRIP_DOMAIN_REGEX, '');
	},

	prettyLogUrl: function(url) {
		return Balanced.Utils.stripDomain(url).replace(PRETTY_LOG_URL_REGEX, '/.../$1').split("?")[0];
	},

	prettyPrint: function(obj) {
		return JSON.stringify(obj, null, 2);
	},

	geoIP: function(ip, callback) {
		if (window.TESTING) {
			return callback("(San Francisco, California, United States)");
		}

		if (ip) {
			return $.ajax('https://freegeoip.net/json/' + ip, {
				dataType: 'jsonp',
				type: 'GET',
				jsonp: 'callback'
			}).then(function(result) {
				var geoIpString;

				if (result.city && result.region_name && result.country_name) {
					geoIpString = '(' + result.city + ', ' + result.region_name + ', ' + result.country_name + ')';
				} else if (result.region_name && result.country_name) {
					geoIpString = '(' + result.region_name + ', ' + result.country_name + ')';
				}

				if (_.isFunction(callback)) {
					return callback(geoIpString);
				} else {
					return geoIpString;
				}
			});
		}
	},

	toTitleCase: function(str) {
		if (!str) {
			return str;
		}

		return str.replace(UNDERSCORE_REPLACE_REGEX, ' ').replace(TO_TITLECASE_REGEX, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	},

	getParamByName: function(uri, name) {
		name = name.replace(PARAM_HELPER_1_REGEX, "\\\\[").replace(PARAM_HELPER_2_REGEX, "\\\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(uri);
		return results === null ? "" : decodeURIComponent(results[1].replace(PARAM_URI_DECODE_REGEX, " "));
	},

	/*
	 * Inserts or updates a single query string parameter
	 */
	updateQueryStringParameter: function(uri, key, value) {
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf("?") > -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, "$1" + key + "=" + value + "$2");
		} else {
			return uri + separator + key + "=" + value;
		}
	},

	sortDict: function(dict) {
		var sorted = [];
		for (var key in dict) {
			sorted[sorted.length] = key;
		}
		sorted.sort();

		var tempDict = {};
		for (var i = 0; i < sorted.length; i++) {
			tempDict[sorted[i]] = dict[sorted[i]];
		}

		return tempDict;
	},

	formatCurrency: function(cents) {
		if (!cents) {
			return '$0.00';
		}

		var prepend = '$';
		if (cents < 0) {
			cents = cents * -1;
			prepend = '-$';
		}

		return prepend + (cents / 100).toFixed(2).replace(FORMAT_CURRENCY_REGEX, '$1,');
	},

	formatNumber: function(number) {
		if (!number) {
			return 0;
		}

		return ('' + number).replace(FORMAT_NUMBER_REGEX, ",");
	},

	formatError: function(error) {
		if (error !== null && error !== undefined) {
			var split = error.search(FORMAT_ERROR_REGEX);
			if (split !== -1) {
				return error.slice(split + 2);
			}
		}
		return error;
	},

	capitalize: function(str) {
		if (!str) {
			return str;
		}

		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	dollarsToCents: function(dollars) {
		if (!dollars) {
			throw new Error('%@ is not a valid dollar amount'.fmt(dollars));
		}

		// remove commas and whitespace
		dollars = dollars.replace(REMOVE_COMMA_WHITESPACE_REGEX, '');

		// make sure our input looks reasonable now, or else fail
		if (!CURRENCY_TEST_REGEX.test(dollars)) {
			throw new Error('%@ is not a valid dollar amount'.fmt(dollars));
		}

		return Math.round(100 * parseFloat(dollars));
	},

	toGravatar: function(emailHash) {
		return emailHash ? 'https://secure.gravatar.com/avatar/%@?s=30&d=mm'.fmt(emailHash) : 'https://secure.gravatar.com/avatar?s=30&d=mm';
	},

	setCurrentMarketplace: function(marketplace) {
		// Store the marketplace in a global so we can use it for auth.
		// TODO: TAKE THIS OUT when we've moved to oAuth
		Balanced.currentMarketplace = marketplace;
		if (marketplace) {
			Balanced.Auth.rememberLastUsedMarketplaceUri(marketplace.get('uri'));

			var userMarketplace = Balanced.Auth.get('user').user_marketplace_for_id(marketplace.get('id'));
			if (userMarketplace) {
				Balanced.Auth.setAPIKey(userMarketplace.get('secret'));
			} else {
				Ember.Logger.warn("Couldn't find API key for %@".fmt(marketplace.get('uri')));
			}
		}
	},

	applyUriFilters: function(uri, params) {
		if (!uri) {
			return uri;
		}

		var transformedParams = ['limit', 'offset', 'sortField', 'sortOrder', 'minDate', 'maxDate', 'type', 'query'];

		var filteringParams = {
			limit: ( !! Ember.testing && !Balanced.Adapter.dataMap) ? 2 : (params.limit || 10),
			offset: params.offset || 0
		};

		if (params.sortField && params.sortOrder && params.sortOrder !== 'none') {
			filteringParams.sort = params.sortField + ',' + params.sortOrder;
		}

		if (params.minDate) {
			filteringParams['created_at[>]'] = params.minDate.toISOString();
		}
		if (params.maxDate) {
			filteringParams['created_at[<]'] = params.maxDate.toISOString();
		}
		if (params.type) {
			switch (params.type) {
				case 'search':
					filteringParams['type[in]'] = Balanced.SEARCH.SEARCH_TYPES.join(',');
					break;
				case 'transaction':
					filteringParams['type[in]'] = Balanced.SEARCH.TRANSACTION_TYPES.join(',');
					break;
				case 'funding_instrument':
					filteringParams['type[in]'] = Balanced.SEARCH.FUNDING_INSTRUMENT_TYPES.join(',');
					break;
				default:
					filteringParams.type = params.type;
			}
		}
		filteringParams.q = '';
		if (params.query && params.query !== '%') {
			filteringParams.q = params.query;
		}

		filteringParams = _.extend(filteringParams, _.omit(params, transformedParams));

		filteringParams = Balanced.Utils.sortDict(filteringParams);

		var queryString = $.map(filteringParams, function(v, k) {
			return encodeURIComponent(k) + '=' + encodeURIComponent(v);
		}).join('&');

		uri += '?' + queryString;

		return uri;
	},

	/*
	 * This function checks whether data is loaded, when it is loaded, loadedFunc
	 * is called and the result is returned. Otherwise, result of loadingFunc()
	 * will be returned and callback(loadedFunc()) will be called once the data is loaded
	 *
	 * It is very useful for getting a loading message when it is loading,
	 * update the information later with the data is loaded.
	 */
	maybeDeferredLoading: function(data, callback, loadingFunc, loadedFunc) {
		// the data is already loaded
		if (data.isLoaded) {
			return loadedFunc();
		}

		// called when data is loaded
		data.on('didLoad', function() {
			callback(loadedFunc());
		});
		return loadingFunc();
	},

	combineUri: function(baseUri, path) {
		if (!baseUri || !path) {
			throw new Error("Can't combine URIs: %@ %@".fmt(baseUri, path));
		}

		// strip trailing slash
		if (baseUri[baseUri.length - 1] === '/') {
			baseUri = baseUri.substring(0, baseUri.length - 1);
		}

		// strip leading slash
		if (path[0] === '/') {
			path = path.substring(1);
		}

		return baseUri + '/' + path;
	},

	date_formats: {
		short: '%e %b \'%y %l:%M %p',
		long: '%a, %e %b %Y, %l:%M %p',
	},

	humanReadableDateShort: function(isoDate) {
		if (isoDate) {
			return Date.parseISO8601(isoDate).strftime(Balanced.Utils.date_formats.short);
		} else {
			return isoDate;
		}
	},

	humanReadableDateLong: function(isoDate) {
		if (isoDate) {
			return Date.parseISO8601(isoDate).strftime(Balanced.Utils.date_formats.long);
		} else {
			return isoDate;
		}
	},

	// filters any number that is in the form of a string and longer than 4 digits (bank codes, ccard numbers etc)
	filterSensitiveData: function(str) {
		if (Ember.isNone(str)) {
			return str;
		}
		var strValue = '' + str;
		return strValue.replace(HIDE_BA_NUMBER_REGEX, '$1$2').replace(HIDE_CC_NUMBER_REGEX, 'XX-HIDE-XX-$2');
	},

	// Takes a hash and filters out all the sensitive data. Only preserves
	// top-level properties, since mixpanel doesn't do nested properties
	filterSensitivePropertiesMap: function(obj) {
		if (!obj) {
			return obj;
		}

		var ret = {};
		for (var name in obj) {
			if (obj.hasOwnProperty(name)) {
				ret[name] = Balanced.Utils.filterSensitiveData(obj[name]);
			}
		}
		return ret;
	},

	encodeAuthorization: function(apiKey) {
		return 'Basic ' + window.btoa(apiKey + ':');
	},

	extractValidationErrorHash: function(errorsRoot) {
		var errorsHash = {};
		_.each(errorsRoot.errors, function(error) {
			for (var key in error.extras) {
				errorsHash[key] = error.extras[key];
			}
		});
		return errorsHash;
	},

	traverse: function(o, fn, ctx, addlKey) {
		addlKey = addlKey || '';

		_.each(o, function(val, key) {
			fn.call(this, val, addlKey + key);

			if (_.isObject(val)) {
				Balanced.Utils.traverse(val, fn, ctx, key + '.');
			}
		}, ctx);
	}

});
