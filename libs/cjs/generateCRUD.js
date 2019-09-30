const dbQuery =  require('../db')

function generateCRUD(router, table, columns) {

    router.get(`/${table}`, async(req, res) => {
        let items = await dbQuery(`SELECT * FROM ${table}`)
        res.send(items)
    })

    router.post(`/${table}`, async(req, res) => {
        let result = await dbQuery(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(column => '?').join(',')})`, [...columns.map(column => req.body[column])])
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Duplicate Entry' })
        } else {
            res.send({ status: 'success', data: { insertedId: result.insertId } })
        }
    })

    router.put(`/${table}/:id`, async(req, res) => {
        let result = await dbQuery(`UPDATE ${table} SET ${columns.map(column => column + '=?').join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`, [...columns.map(column => req.body[column]), req.params.id])
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Duplicate Entry' })
        } else {
            res.send({ status: 'success' })
        }
    })

    router.delete(`/${table}/:id`, async(req, res) => {
        let result = await dbQuery(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
        if(result.hasOwnProperty('error')) {
            res.send({ status: 'error', message: 'Entry in use' })
        } else {
            res.send({ status: 'success' })
        }
    })

}

module.exports = generateCRUD
