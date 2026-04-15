import type { INodeProperties } from 'n8n-workflow';

export const operationOptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getCustomers',
		options: [
			{
				name: 'Create Invoice',
				value: 'createInvoice',
				description: 'Create an invoice in Abacus ERP',
				action: 'Create an invoice',
			},
			{
				name: 'Get Customers',
				value: 'getCustomers',
				description: 'Fetch customers with optional filtering',
				action: 'Get customers',
			},
			{
				name: 'Get Orders',
				value: 'getOrders',
				description: 'Fetch orders with optional filtering',
				action: 'Get orders',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['getCustomers', 'getOrders'],
			},
		},
		description: 'Whether to return all results across all pages',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		displayOptions: {
			show: {
				operation: ['getCustomers', 'getOrders'],
				returnAll: [false],
			},
		},
		description: 'Page number to fetch when Return All is disabled',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 250,
		},
		default: 50,
		displayOptions: {
			show: {
				operation: ['getCustomers', 'getOrders'],
			},
		},
		description: 'Number of records to request per page',
	},
	{
		displayName: 'Retry Count',
		name: 'retryCount',
		type: 'number',
		default: 3,
		typeOptions: {
			minValue: 0,
			maxValue: 10,
		},
		description: 'Number of retries for transient errors such as 429 or 5xx responses',
	},
	{
		displayName: 'Retry Delay (ms)',
		name: 'retryDelayMs',
		type: 'number',
		default: 1000,
		typeOptions: {
			minValue: 100,
		},
		description: 'Base delay between retries; exponential backoff is applied automatically',
	},
	{
		displayName: 'Request Timeout (ms)',
		name: 'timeout',
		type: 'number',
		default: 30000,
		typeOptions: {
			minValue: 1000,
		},
		description: 'Timeout for each HTTP request',
	},
];

export const customerFields: INodeProperties[] = [
	{
		displayName: 'Search',
		name: 'customerSearch',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['getCustomers'],
			},
		},
		description: 'Optional search term for customer name, code, or email',
	},
	{
		displayName: 'Status',
		name: 'customerStatus',
		type: 'options',
		default: 'all',
		displayOptions: {
			show: {
				operation: ['getCustomers'],
			},
		},
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Active', value: 'active' },
			{ name: 'Archived', value: 'archived' },
			{ name: 'Inactive', value: 'inactive' },
		],
	},
	{
		displayName: 'Updated Since',
		name: 'customerUpdatedSince',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				operation: ['getCustomers'],
			},
		},
		description: 'Only return customers updated on or after this timestamp',
	},
];

export const orderFields: INodeProperties[] = [
	{
		displayName: 'Order Status',
		name: 'orderStatus',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['getOrders'],
			},
		},
		description: 'Optional order status filter such as open, shipped, or closed',
	},
	{
		displayName: 'Customer ID',
		name: 'orderCustomerId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['getOrders'],
			},
		},
		description: 'Optional customer identifier',
	},
	{
		displayName: 'Created Since',
		name: 'orderCreatedSince',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				operation: ['getOrders'],
			},
		},
		description: 'Only return orders created on or after this timestamp',
	},
];

export const invoiceFields: INodeProperties[] = [
	{
		displayName: 'Customer ID',
		name: 'invoiceCustomerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
		description: 'Customer identifier used by Abacus ERP',
	},
	{
		displayName: 'Invoice Date',
		name: 'invoiceDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Due Date',
		name: 'invoiceDueDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'invoiceCurrency',
		type: 'string',
		default: 'USD',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Reference',
		name: 'invoiceReference',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Notes',
		name: 'invoiceNotes',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Invoice Lines',
		name: 'invoiceLines',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {
			line: [
				{
					itemCode: '',
					description: '',
					quantity: 1,
					unitPrice: 0,
					taxCode: '',
				},
			],
		},
		displayOptions: {
			show: {
				operation: ['createInvoice'],
			},
		},
		options: [
			{
				name: 'line',
				displayName: 'Line',
				values: [
					{
						displayName: 'Item Code',
						name: 'itemCode',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						required: true,
						typeOptions: {
							minValue: 0.0001,
						},
					},
					{
						displayName: 'Unit Price',
						name: 'unitPrice',
						type: 'number',
						default: 0,
						required: true,
					},
					{
						displayName: 'Tax Code',
						name: 'taxCode',
						type: 'string',
						default: '',
					},
				],
			},
		],
		description: 'Line items that will be sent to Abacus ERP',
	},
];
