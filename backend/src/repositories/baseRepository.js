export default class BaseRepository {
    constructor(model, pool) {
        this.model = model;
        this.pool = pool;
    }

    async get(id) {
        const result = await this.pool
            .request()
            .input("id", id)
            .query(`SELECT * FROM ${this.model.tableName} WHERE id = @id`);
        return result.recordset[0] || null;
    }

    async list(limit = 100, offset = 0) {
        const result = await this.pool
            .request()
            .input("limit", limit)
            .input("offset", offset)
            .query(`
                SELECT * FROM ${this.model.tableName}
                ORDER BY id
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
        return result.recordset;
    }

    async findOneBy(filters) {
        const keys = Object.keys(filters);
        if (!keys.length) return null;

        const whereClause = keys.map((k) => `${k} = @${k}`).join(" AND ");
        const request = this.pool.request();
        keys.forEach((k) => request.input(k, filters[k]));

        const result = await request.query(
            `SELECT TOP 1 * FROM ${this.model.tableName} WHERE ${whereClause}`
        );
        return result.recordset[0] || null;
    }

    async findBy(filters) {
        const keys = Object.keys(filters);
        if (!keys.length) return [];

        const whereClause = keys.map((k) => `${k} = @${k}`).join(" AND ");
        const request = this.pool.request();
        keys.forEach((k) => request.input(k, filters[k]));

        const result = await request.query(
            `SELECT * FROM ${this.model.tableName} WHERE ${whereClause}`
        );
        return result.recordset;
    }

    async create(data) {
        const keys = Object.keys(data);
        const columns = keys.join(", ");
        const values = keys.map((k) => `@${k}`).join(", ");

        const request = this.pool.request();
        keys.forEach((k) => request.input(k, data[k]));

        const query = `
            INSERT INTO ${this.model.tableName} (${columns})
            VALUES (${values});
        `;
        await request.query(query);
        return data;
    }

    async upsert(uniqueBy, data) {
        const filters = {};
        uniqueBy.forEach((k) => (filters[k] = data[k]));

        let obj = await this.findOneBy(filters);
        if (obj) {
            const setClause = Object.keys(data)
                .map((k) => `${k} = @${k}`)
                .join(", ");
            const request = this.pool.request();
            Object.entries(data).forEach(([k, v]) => request.input(k, v));
            await request.query(
                `UPDATE ${this.model.tableName} SET ${setClause} WHERE id = @id`
            );
            obj = { ...obj, ...data };
        } else {
            obj = await this.create(data);
        }
        return obj;
    }

    async delete(id) {
        await this.pool
            .request()
            .input("id", id)
            .query(`DELETE FROM ${this.model.tableName} WHERE id = @id`);
    }
}