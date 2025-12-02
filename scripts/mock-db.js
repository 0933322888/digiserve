
class MockCollection {
    constructor(name) {
        this.name = name
        this.data = []
    }

    async find(query = {}) {
        // Simple query matching
        return this.data.filter(item => {
            for (const key in query) {
                if (key === 'startTime' || key === 'clockIn') {
                    // Handle date range queries
                    const dateVal = new Date(item[key])
                    if (query[key].$gte && dateVal < new Date(query[key].$gte)) return false
                    if (query[key].$lte && dateVal > new Date(query[key].$lte)) return false
                } else if (typeof query[key] === 'object') {
                    // Ignore other complex queries for now
                } else if (item[key] !== query[key]) {
                    return false
                }
            }
            return true
        })
    }

    async findOne(query = {}) {
        const results = await this.find(query)
        return results.length > 0 ? results[0] : null
    }

    async insertOne(doc) {
        this.data.push(doc)
        return { insertedId: doc.id, acknowledged: true }
    }

    async updateOne(query, update) {
        const item = await this.findOne(query)
        if (!item) return { matchedCount: 0, modifiedCount: 0 }

        const updates = update.$set || update
        Object.assign(item, updates)
        return { matchedCount: 1, modifiedCount: 1 }
    }

    async updateMany(query, update) {
        const items = await this.find(query)
        const updates = update.$set || update
        items.forEach(item => Object.assign(item, updates))
        return { matchedCount: items.length, modifiedCount: items.length }
    }

    async deleteOne(query) {
        const index = this.data.findIndex(item => {
            for (const key in query) {
                if (item[key] !== query[key]) return false
            }
            return true
        })
        if (index !== -1) {
            this.data.splice(index, 1)
            return { deletedCount: 1 }
        }
        return { deletedCount: 0 }
    }
}

class MockDatabase {
    constructor() {
        this.collections = {}
    }

    collection(name) {
        if (!this.collections[name]) {
            this.collections[name] = new MockCollection(name)
        }
        return this.collections[name]
    }
}

export const db = new MockDatabase()
