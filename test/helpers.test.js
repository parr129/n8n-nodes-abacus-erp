const assert = require('node:assert/strict');

const {
	buildInvoicePayload,
	getCustomerQuery,
	getOrderQuery,
} = require('../dist/nodes/AbacusErp/GenericFunctions.js');

function run() {
	const payload = buildInvoicePayload({
		invoiceCustomerId: 'CUS-1001',
		invoiceDate: '2026-04-15T00:00:00.000Z',
		invoiceCurrency: 'USD',
		invoiceLines: {
			line: [
				{
					itemCode: 'ITEM-1',
					description: 'Implementation fee',
					quantity: 1,
					unitPrice: 2500,
					taxCode: 'VAT',
				},
			],
		},
	});

	assert.equal(payload.customerId, 'CUS-1001');
	assert.equal(payload.items.length, 1);
	assert.equal(payload.items[0].itemCode, 'ITEM-1');

	const query = getCustomerQuery({
		page: 2,
		pageSize: 100,
		customerSearch: 'acme',
		customerStatus: 'active',
		customerUpdatedSince: '2026-04-01T00:00:00.000Z',
	});

	assert.deepEqual(query, {
		page: 2,
		limit: 100,
		search: 'acme',
		status: 'active',
		updated_since: '2026-04-01T00:00:00.000Z',
	});

	const orderQuery = getOrderQuery({
		page: 1,
		pageSize: 50,
		orderStatus: 'open',
		orderCustomerId: 'CUS-1001',
		orderCreatedSince: '2026-03-01T00:00:00.000Z',
	});

	assert.deepEqual(orderQuery, {
		page: 1,
		limit: 50,
		status: 'open',
		customer_id: 'CUS-1001',
		created_since: '2026-03-01T00:00:00.000Z',
	});
	console.log('Helper assertions passed.');
}

try {
	run();
} catch (error) {
	console.error(error);
	process.exit(1);
}
