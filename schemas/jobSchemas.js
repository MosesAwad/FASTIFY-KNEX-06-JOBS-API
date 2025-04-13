
const createJobOpts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                role: {type: 'string', maxLength: 100},
                company: {type: 'string', maxLength: 50}, 
                status: {type: 'string', enum: ['interview', 'pending', 'decline'], default: 'pending'},
                createdBy: {type: 'integer'}
            },
            required: ['role', 'company', 'createdBy']
        }
    }
}

const updateJobOpts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                role: {type: 'string', maxLength: 100},
                company: {type: 'string', maxLength: 50}, 
                status: {type: 'string', enum: ['interview', 'pending', 'decline'], default: 'pending'},
                createdBy: {type: 'integer'}
            }
        },
    }
}

module.exports = {
    createJobOpts,
    updateJobOpts
}
