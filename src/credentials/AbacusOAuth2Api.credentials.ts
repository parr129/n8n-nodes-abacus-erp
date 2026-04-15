import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AbacusOAuth2Api implements ICredentialType {
	name = 'abacusOAuth2Api';

	displayName = 'Abacus ERP OAuth2 API';

	documentationUrl = 'https://github.com/your-org/n8n-nodes-abacus-erp';

	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: 'https://auth.abacuserp.example.com/oauth/authorize',
			required: true,
			description: 'OAuth2 authorization endpoint for the Abacus tenant',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'https://auth.abacuserp.example.com/oauth/token',
			required: true,
			description: 'OAuth2 token endpoint for the Abacus tenant',
		},
		{
			displayName: 'Base API URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.abacuserp.example.com/v1',
			required: true,
			description: 'Base URL of the Abacus ERP REST API',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'customers.read orders.read invoices.write offline_access',
			description: 'Space-delimited OAuth2 scopes',
		},
		{
			displayName: 'Include Credentials In',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication Method',
			name: 'oauthTokenData',
			type: 'hidden',
			default: '',
		},
	];
}
