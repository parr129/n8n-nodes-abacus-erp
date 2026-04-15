import {
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { customerFields, invoiceFields, operationOptions, orderFields } from './descriptions';
import {
	abacusApiRequest,
	buildInvoicePayload,
	buildListReturn,
	fetchAllPages,
	getCustomerQuery,
	getOrderQuery,
	wrapSingleResult,
} from './GenericFunctions';

export class AbacusErp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Abacus ERP',
		name: 'abacusErp',
		icon: 'file:abacus.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Work with Abacus ERP customers, invoices, and orders',
		defaults: {
			name: 'Abacus ERP',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'abacusOAuth2Api',
				required: true,
			},
		],
		properties: [...operationOptions, ...customerFields, ...orderFields, ...invoiceFields],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const retryCount = this.getNodeParameter('retryCount', itemIndex, 3) as number;
				const retryDelayMs = this.getNodeParameter('retryDelayMs', itemIndex, 1000) as number;
				const timeout = this.getNodeParameter('timeout', itemIndex, 30000) as number;
				const item = items[itemIndex].json as IDataObject;

				if (operation === 'getCustomers') {
					const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
					const query = getCustomerQuery({
						...item,
						page: this.getNodeParameter('page', itemIndex, 1),
						pageSize: this.getNodeParameter('pageSize', itemIndex, 50),
						customerSearch: this.getNodeParameter('customerSearch', itemIndex, ''),
						customerStatus: this.getNodeParameter('customerStatus', itemIndex, 'all'),
						customerUpdatedSince: this.getNodeParameter('customerUpdatedSince', itemIndex, ''),
					});

					if (returnAll) {
						const customers = await fetchAllPages(this, {
							endpoint: '/customers',
							qs: query,
							retryCount,
							retryDelayMs,
							timeout,
						});
						returnData.push(...buildListReturn(customers));
						continue;
					}

					const response = await abacusApiRequest(this, {
						endpoint: '/customers',
						method: 'GET',
						qs: query,
						retryCount,
						retryDelayMs,
						timeout,
					});

					returnData.push(...wrapSingleResult(response));
					continue;
				}

				if (operation === 'getOrders') {
					const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
					const query = getOrderQuery({
						...item,
						page: this.getNodeParameter('page', itemIndex, 1),
						pageSize: this.getNodeParameter('pageSize', itemIndex, 50),
						orderStatus: this.getNodeParameter('orderStatus', itemIndex, ''),
						orderCustomerId: this.getNodeParameter('orderCustomerId', itemIndex, ''),
						orderCreatedSince: this.getNodeParameter('orderCreatedSince', itemIndex, ''),
					});

					if (returnAll) {
						const orders = await fetchAllPages(this, {
							endpoint: '/orders',
							qs: query,
							retryCount,
							retryDelayMs,
							timeout,
						});
						returnData.push(...buildListReturn(orders));
						continue;
					}

					const response = await abacusApiRequest(this, {
						endpoint: '/orders',
						method: 'GET',
						qs: query,
						retryCount,
						retryDelayMs,
						timeout,
					});

					returnData.push(...wrapSingleResult(response));
					continue;
				}

				if (operation === 'createInvoice') {
					const payload = buildInvoicePayload({
						...item,
						invoiceCustomerId: this.getNodeParameter('invoiceCustomerId', itemIndex),
						invoiceDate: this.getNodeParameter('invoiceDate', itemIndex),
						invoiceDueDate: this.getNodeParameter('invoiceDueDate', itemIndex, ''),
						invoiceCurrency: this.getNodeParameter('invoiceCurrency', itemIndex, 'USD'),
						invoiceReference: this.getNodeParameter('invoiceReference', itemIndex, ''),
						invoiceNotes: this.getNodeParameter('invoiceNotes', itemIndex, ''),
						invoiceLines: this.getNodeParameter('invoiceLines', itemIndex),
					});

					const response = await abacusApiRequest(this, {
						endpoint: '/invoices',
						method: 'POST',
						body: payload as unknown as IDataObject,
						retryCount,
						retryDelayMs,
						timeout,
					});

					returnData.push(...wrapSingleResult(response));
					continue;
				}

				throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
					itemIndex,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown execution error',
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}

				throw error;
			}
		}

		return [returnData];
	}
}
