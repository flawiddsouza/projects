const dbQuery =  require('../db')

function generateCRUD(router, route, table, columns, where=null) {

    router.get(`/${route}`, async(req, res) => {
        let items = null
        if(!where) {
            items = await dbQuery(`SELECT * FROM ${table} ORDER BY ${columns.includes('sort_order') ? 'sort_order' : 'id'}`)
        } else {
            items = await dbQuery(`SELECT * FROM ${table} WHERE ${where.where} = ${req[where.equals]} ORDER BY ${columns.includes('sort_order') ? 'sort_order' : 'id'}`)
        }
        res.send(items)
    })

    router.post(`/${route}`, async(req, res) => {
        let result = null
        if(!where) {
            result = await dbQuery(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(() => '?').join(',')})`, [...columns.map(column => req.body[column])])
        } else {
            result = await dbQuery(`INSERT INTO ${table}(${columns.join(',')}, ${where.where}) VALUES(${columns.map(() => '?').join(',')},?)`, [...columns.map(column => req.body[column]), req[where.equals]])
        }
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Duplicate Entry' })
        } else {
            res.send({ status: 'success', data: { insertedId: result.insertId } })
        }
    })

    router.put(`/${route}/:id`, async(req, res) => {
        let result = await dbQuery(`UPDATE ${table} SET ${columns.map(column => column + '=?').join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`, [...columns.map(column => req.body[column]), req.params.id])
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Duplicate Entry' })
        } else {
            res.send({ status: 'success' })
        }
    })

    router.delete(`/${route}/:id`, async(req, res) => {
        let result = await dbQuery(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Entry in use' })
        } else {
            res.send({ status: 'success' })
        }
    })

}

module.exports = generateCRUD
