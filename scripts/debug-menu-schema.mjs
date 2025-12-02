import mongoose from 'mongoose'

// Define Schema exactly as in models.js
const MenuSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        active: { type: Boolean, default: false },
        sections: [
            {
                _id: false,
                id: String,
                name: String,
                description: String,
                items: [
                    {
                        _id: false,
                        id: String,
                        name: String,
                        description: String,
                        price: Number,
                        dietary: [String],
                        serves: Number,
                        size: String,
                        options: [
                            {
                                _id: false,
                                name: String,
                                price: Number,
                            },
                        ],
                        unavailable: { type: Boolean, default: false },
                        archived: { type: Boolean, default: false },
                    },
                ],
            },
        ],
    },
    { timestamps: false }
)

const Menu = mongoose.model('MenuTest', MenuSchema)

async function run() {
    console.log('Starting validation...')

    const sectionData = {
        id: 'red-wine',
        name: 'Red Wine',
        description: 'Glass (5oz) / Half Litre (18oz) / Bottle (26oz)',
        items: [
            {
                id: 'red-1',
                name: 'Luigi Righetti Valpolicella Ripasso Classico Superiore (Italy)',
                description: 'Glass: $15 | 1/2 Litre: $52 | Bottle: $75',
                price: 15,
                dietary: [],
                serves: null,
                size: null,
                options: [],
                unavailable: false,
                archived: false
            }
        ]
    }

    try {
        console.log('Attempting to validate menu with section...')
        const menu = new Menu({
            id: 'test-menu',
            name: 'Test Menu',
            sections: [sectionData]
        })

        // validateSync doesn't need DB connection
        const error = menu.validateSync()
        if (error) {
            console.error('❌ Validation failed:', error)
        } else {
            console.log('✅ Validation successful')
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

run()
