const { dbQuery } =  require('./db')

async function isSuperAdmin(userId) {
    let isSuperAdmin = await dbQuery(`
        SELECT id
        FROM admins
        WHERE organization_id IS NULL AND user_id = ?
    `, [userId])

    if(isSuperAdmin.length > 0) {
        isSuperAdmin = true
    } else {
        isSuperAdmin = false
    }

    return isSuperAdmin
}

async function isOrganizationAdmin(userId, organizationId) {
    let isOrganizationAdmin = await dbQuery(`
        SELECT id
        FROM admins
        WHERE organization_id = ? AND user_id = ?
    `, [organizationId, userId])

    if(isOrganizationAdmin.length > 0) {
        isOrganizationAdmin = true
    } else {
        isOrganizationAdmin = false
    }

    return isOrganizationAdmin
}

module.exports = { isSuperAdmin, isOrganizationAdmin }
