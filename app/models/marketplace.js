require('app/models/user_marketplace');

Balanced.Marketplace = Balanced.UserMarketplace.extend({
	uri: '/marketplaces',

	credits: Balanced.Model.hasMany('credits', 'Balanced.Credit'),
	debits: Balanced.Model.hasMany('debits', 'Balanced.Debit'),
	// disputes: Balanced.Model.hasMany('disputes', 'Balanced.Dispute'),
	refunds: Balanced.Model.hasMany('refunds', 'Balanced.Refund'),
	holds: Balanced.Model.hasMany('holds', 'Balanced.Hold'),
	transactions: Balanced.Model.hasMany('transactions', 'Balanced.Transaction'),
	callbacks: Balanced.Model.hasMany('callbacks', 'Balanced.Callback'),

	funding_instruments: Balanced.Model.hasMany('funding_instruments', 'Balanced.FundingInstrument'),
	bank_accounts: Balanced.Model.hasMany('bank_accounts', 'Balanced.BankAccount'),
	cards: Balanced.Model.hasMany('cards', 'Balanced.Card'),

	owner_account: Balanced.Model.belongsTo('owner_account', 'Balanced.Account'),
	owner_customer: Balanced.Model.belongsTo('owner_customer', 'Balanced.Customer'),

	customers: Balanced.Model.hasMany('customers', 'Balanced.Customer'),

	funding_instruments_uri: Balanced.computed.concat('uri', '/search?limit=10&offset=0&q=&type[in]=bank_account,card'),

	// TODO - take this out once marketplace has a link to invoices list
	users_uri: function() {
		return '/marketplaces/%@/users'.fmt(this.get('id'));
	}.property('id'),
	invoices_uri: '/invoices',
	disputes_uri: '/disputes',

	populateWithTestTransactions: function() {
		//  pre-populate marketplace with transactions
		var id = this.get('id');
		Balanced.NET.ajax({
			url: ENV.BALANCED.AUTH + '/marketplaces/%@/spam'.fmt(id),
			type: 'PUT'
		});
	}
});

Balanced.TypeMappings.addTypeMapping('marketplace', 'Balanced.Marketplace');

Balanced.Marketplace.reopenClass({
	serializer: Balanced.Rev1Serializer.create()
});
