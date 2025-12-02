import fs from 'fs'
import path from 'path'

/**
 * A simple JSON-file backed database adapter that mimics MongoDB's collection API.
 */
class JsonCollection {
  constructor(filePath, dataPath = null) {
    this.filePath = filePath
    // dataPath is the property name in the JSON file where the array lives (e.g. 'menus', 'employees')
    // If null, assumes the file IS the array or the array is at the root (handled dynamically)
    this.dataPath = dataPath
  }

  _read() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return []
      }
      const content = fs.readFileSync(this.filePath, 'utf8')
      const json = JSON.parse(content)

      if (Array.isArray(json)) {
        return json
      }

      if (this.dataPath && Array.isArray(json[this.dataPath])) {
        return json[this.dataPath]
      }

      // Fallback: try to find the first array property
      const values = Object.values(json)
      const arrayVal = values.find(v => Array.isArray(v))
      return arrayVal || []
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error)
      return []
    }
  }

  _write(items) {
    try {
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      let dataToWrite = items

      // If we need to preserve a specific structure (like { menus: [...] })
      if (this.dataPath) {
        // Try to read existing to preserve other top-level keys if any
        let existing = {}
        try {
          if (fs.existsSync(this.filePath)) {
            existing = JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
          }
        } catch (e) {}

        dataToWrite = {
          ...existing,
          [this.dataPath]: items,
        }
      }

      fs.writeFileSync(this.filePath, JSON.stringify(dataToWrite, null, 2))
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error)
      throw error
    }
  }

  _matches(item, query) {
    for (const [key, value] of Object.entries(query)) {
      if (item[key] !== value) {
        return false
      }
    }
    return true
  }

  async find(query = {}) {
    const items = this._read()
    if (Object.keys(query).length === 0) {
      return items
    }
    return items.filter(item => this._matches(item, query))
  }

  async findOne(query = {}) {
    const items = this._read()
    return items.find(item => this._matches(item, query)) || null
  }

  async insertOne(doc) {
    const items = this._read()
    items.push(doc)
    this._write(items)
    return { insertedId: doc.id, acknowledged: true }
  }

  async updateOne(query, update) {
    const items = this._read()
    const index = items.findIndex(item => this._matches(item, query))

    if (index === -1) {
      return { matchedCount: 0, modifiedCount: 0 }
    }

    // Handle $set operator if present, otherwise assume direct update
    const updates = update.$set || update

    items[index] = {
      ...items[index],
      ...updates,
    }

    this._write(items)
    return { matchedCount: 1, modifiedCount: 1 }
  }

  async deleteOne(query) {
    const items = this._read()
    const initialLength = items.length
    const filtered = items.filter(item => !this._matches(item, query))

    if (filtered.length === initialLength) {
      return { deletedCount: 0 }
    }

    // Only delete the first match to mimic deleteOne
    // Actually, filter deletes ALL matches. To be precise for deleteOne:
    const index = items.findIndex(item => this._matches(item, query))
    if (index !== -1) {
      items.splice(index, 1)
      this._write(items)
      return { deletedCount: 1 }
    }

    return { deletedCount: 0 }
  }

  // Helper for replacing entire collection (used in some service logic)
  async replaceMany(items) {
    this._write(items)
  }
}

export class JsonDatabase {
  constructor(config) {
    this.config = config
    this.collections = {}
  }

  collection(name) {
    if (!this.collections[name]) {
      const colConfig = this.config[name]
      if (!colConfig) {
        throw new Error(`Collection ${name} not configured`)
      }
      this.collections[name] = new JsonCollection(colConfig.path, colConfig.dataPath)
    }
    return this.collections[name]
  }
}
