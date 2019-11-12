const { dbQuery } =  require('./db')
const sendMail =  require('../mail')

async function notifyUserByEmailTaskAssigned(taskId, userIdToNotify, fromUserId) {
    const task = await dbQuery(`
        SELECT
            task_types.type,
            project_categories.category,
            tasks.title,
            projects.name as project_name,
            tasks.project_id
        FROM tasks
        JOIN task_types ON task_types.id = tasks.task_type_id
        LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
        JOIN projects ON projects.id = tasks.project_id
        WHERE tasks.id = ?
    `, [taskId])

    const users = await dbQuery(`
        SELECT id, name, email FROM users
        WHERE id IN (?, ?)
    `, [userIdToNotify, fromUserId])

    const subject = `[${task[0].project_name} ${taskId.toString().padStart(6, '0')}]: ${users.find(user => user.id === fromUserId).name} assigned you to [${task[0].type}] ${task[0].category ? '[' + task[0].category + ']' : ''} ${task[0].title}`

    const body = `Click <a href="SUBSTITUTE_APP_URL/task/${taskId}">here</a> to view the task`

    sendMail(
        users.find(user => user.id === Number(userIdToNotify)).email,
        subject,
        body,
        task[0].project_id
    )
}

module.exports = notifyUserByEmailTaskAssigned
