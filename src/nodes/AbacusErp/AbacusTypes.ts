import type { IDataObject } from 'n8n-workflow';

export interface AbacusPaginationMeta {
	page?: number;
	limit?: number;
	total?: number;
	totalPages?: number;
	nextPage?: number | null;
	hasMore?: boolean;
}

export interface AbacusListResponse<T> {
	data?: T[];
	items?: T[];
	results?: T[];
	meta?: AbacusPaginationMeta;
	pagination?: AbacusPaginationMeta;
}

export interface AbacusInvoiceLineInput {
	itemCode: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	taxCode?: string;
}

export interface AbacusInvoicePayload {
	customerId: string;
	invoiceDate: string;
	dueDate?: string;
	currency?: string;
	reference?: string;
	notes?: string;
	items: AbacusInvoiceLineInput[];
}

export interface AbacusRequestOptions {
	endpoint: string;
	method: 'GET' | 'POST';
	qs?: IDataObject;
	body?: IDataObject;
	retryCount?: number;
	retryDelayMs?: number;
	timeout?: number;
}
