const responseSchema = {
	200: {
	  type: 'object',
	  properties: {
		user: {
		  type: 'object',
		  properties: {
			name: { type: 'string' }
		  },
		  required: ['name']
		},
		token: { type: 'string' }
	  },
	  required: ['user', 'token']
	}
}
  
const registerOpts =  {
	schema: {
		body: {
			type: 'object',
			properties: {
				name: { type: 'string', minLength: 3, maxLength: 50 },
				email: { type: 'string', format: 'email' },
				password: { type: 'string', minLength: 6 }
			},
			required: ['name', 'email', 'password']
		},
		response: responseSchema
	}
}
  
const loginOpts = {
	schema: {
		body: {
			type: 'object',
			properties: {
			'email': { type: 'string', },
			'password': { type: 'string' }
			},
			required: ["email", "password"]
		},
		response: responseSchema
	}
}

module.exports = {
	registerOpts,
	loginOpts
};
