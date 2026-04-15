import {
	NodeApiError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type INodeExecutionData,
	type JsonObject,
} from 'n8n-workflow';

import type {
	AbacusInvoiceLineInput,
	AbacusInvoicePayload,
	AbacusListResponse,
	AbacusPaginationMeta,
	AbacusRequestOptions,
} from './AbacusTypes';

const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function sleep(delayMs: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
}

function pickListData<T>(response: AbacusListResponse<T> | IDataObject | IDataObject[]): T[] {
	if (Array.isArray(response)) {
		return response as T[];
	}

	if (!response || typeof response !== 'object') {
		return [];
	}

	const listResponse = response as AbacusListResponse<T>;
	return listResponse.data ?? listResponse.items ?? listResponse.results ?? [];
}

function getPaginationMeta(response: AbacusListResponse<unknown> | IDataObject | IDataObject[]): AbacusPaginationMeta {
	if (!response || Array.isArray(response) || typeof response !== 'object') {
		return {};
	}

	const listResponse = response as AbacusListResponse<unknown>;
	return listResponse.meta ?? listResponse.pagination ?? {};
}

function shouldRetry(error: unknown, attempt: number, maxRetries: number): boolean {
	if (attempt >= maxRetries) {
		return false;
	}

	const candidate = error as { httpCode?: number; statusCode?: number; response?: { statusCode?: number } };
	const statusCode = candidate.httpCode ?? candidate.statusCode ?? candidate.response?.statusCode;
	return RETRYABLE_STATUS_CODES.has(Number(statusCode));
}

function normalizeAbacusError(error: unknown): IDataObject {
	const candidate = error as {
		message?: string;
		httpCode?: number;
		statusCode?: number;
		response?: {
			statusCode?: number;
			body?: IDataObject;
		};
	};

	const responseBody = candidate.response?.body;
	const details =
		(responseBody?.error as string | undefined) ??
		(responseBody?.message as string | undefined) ??
		(responseBody?.details as string | undefined);

	return {
		message: candidate.message ?? 'Unknown Abacus ERP API error',
		statusCode: candidate.httpCode ?? candidate.statusCode ?? candidate.response?.statusCode,
		details,
		raw: responseBody ?? null,
	};
}

export async function abacusApiRequest(
	context: IExecuteFunctions,
	options: AbacusRequestOptions,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await context.getCredentials('abacusOAuth2Api');
	const baseUrl = String(credentials.baseUrl ?? '').replace(/\/+$/, '');
	const endpoint = options.endpoint.startsWith('/') ? options.endpoint : `/${options.endpoint}`;
	const maxRetries = options.retryCount ?? 3;
	const retryDelayMs = options.retryDelayMs ?? 1000;

	const requestOptions = {
		method: options.method as IHttpRequestMethods,
		url: `${baseUrl}${endpoint}`,
		qs: options.qs,
		body: options.body,
		json: true,
		timeout: options.timeout ?? 30000,
	};

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await context.helpers.httpRequestWithAuthentication.call(
				context,
				'abacusOAuth2Api',
				requestOptions,
			);
		} catch (error) {
			// Retry only for transient upstream or throttling failures.
			if (shouldRetry(error, attempt, maxRetries)) {
				const delay = retryDelayMs * 2 ** attempt;
				await sleep(delay);
				continue;
			}

			const normalizedError = normalizeAbacusError(error);
			throw new NodeApiError(context.getNode(), normalizedError as unknown as JsonObject, {
				httpCode: String(normalizedError.statusCode ?? ''),
				message: 'Abacus ERP API request failed',
				description: JSON.stringify(normalizedError),
			});
		}
	}

	throw new NodeApiError(
		context.getNode(),
		{ message: 'Abacus ERP API retries exhausted' },
		{ message: 'Abacus ERP API retries exhausted' },
	);
}

export async function fetchAllPages(
	context: IExecuteFunctions,
	options: Omit<AbacusRequestOptions, 'method'> & { method?: 'GET' },
): Promise<IDataObject[]> {
	const pageSize = Number(options.qs?.limit ?? 50);
	let page = Number(options.qs?.page ?? 1);
	const allItems: IDataObject[] = [];

	// Continue until the API explicitly signals completion or we infer the last page.
	while (true) {
		const response = await abacusApiRequest(context, {
			...options,
			method: 'GET',
			qs: {
				...options.qs,
				page,
				limit: pageSize,
			},
		});

		const items = pickListData<IDataObject>(response);
		allItems.push(...items);

		if (items.length < pageSize) {
			break;
		}

		const pagination = getPaginationMeta(response);
		if (pagination.hasMore === false) {
			break;
		}

		if (pagination.nextPage != null) {
			page = Number(pagination.nextPage);
			continue;
		}

		if (
			pagination.totalPages != null &&
			pagination.page != null &&
			pagination.page >= pagination.totalPages
		) {
			break;
		}

		page += 1;
	}

	return allItems;
}

export function buildInvoicePayload(item: IDataObject): AbacusInvoicePayload {
	const invoiceLinesContainer = item.invoiceLines as IDataObject | undefined;
	const lines = (invoiceLinesContainer?.line as IDataObject[] | undefined) ?? [];

	if (!lines.length) {
		throw new Error('At least one invoice line is required.');
	}

	return {
		customerId: String(item.invoiceCustomerId),
		invoiceDate: String(item.invoiceDate),
		dueDate: item.invoiceDueDate ? String(item.invoiceDueDate) : undefined,
		currency: item.invoiceCurrency ? String(item.invoiceCurrency) : undefined,
		reference: item.invoiceReference ? String(item.invoiceReference) : undefined,
		notes: item.invoiceNotes ? String(item.invoiceNotes) : undefined,
		items: lines.map((line): AbacusInvoiceLineInput => ({
			itemCode: String(line.itemCode),
			description: line.description ? String(line.description) : undefined,
			quantity: Number(line.quantity),
			unitPrice: Number(line.unitPrice),
			taxCode: line.taxCode ? String(line.taxCode) : undefined,
		})),
	};
}

export function buildListReturn(items: IDataObject[]): INodeExecutionData[] {
	return items.map((item) => ({ json: item }));
}

export function getCustomerQuery(item: IDataObject): IDataObject {
	const query: IDataObject = {
		page: Number(item.page ?? 1),
		limit: Number(item.pageSize ?? 50),
	};

	if (item.customerSearch) {
		query.search = item.customerSearch;
	}

	if (item.customerStatus && item.customerStatus !== 'all') {
		query.status = item.customerStatus;
	}

	if (item.customerUpdatedSince) {
		query.updated_since = item.customerUpdatedSince;
	}

	return query;
}

export function getOrderQuery(item: IDataObject): IDataObject {
	const query: IDataObject = {
		page: Number(item.page ?? 1),
		limit: Number(item.pageSize ?? 50),
	};

	if (item.orderStatus) {
		query.status = item.orderStatus;
	}

	if (item.orderCustomerId) {
		query.customer_id = item.orderCustomerId;
	}

	if (item.orderCreatedSince) {
		query.created_since = item.orderCreatedSince;
	}

	return query;
}

export function wrapSingleResult(result: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (Array.isArray(result)) {
		return buildListReturn(result as IDataObject[]);
	}

	return [{ json: result as IDataObject }];
}
