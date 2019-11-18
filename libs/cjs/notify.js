const { dbQuery } =  require('./db')
const sendMail =  require('../mail')

async function notifyOnTaskComment(taskId, taskCommentId, userIdsToNotify) {

    let task = await dbQuery(`
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

    if(task.length > 0) {
        task = task[0]
    } else {
        return
    }

    let comment = await dbQuery(`
        SELECT
            task_comments.*,
            users.name as user
        FROM task_comments
        JOIN users ON users.id = task_comments.user_id
        WHERE task_comments.id = ?
    `, [taskCommentId])

    if(comment.length > 0) {
        comment = comment[0]
    } else {
        return
    }

    const usersToNotify = await dbQuery(`
        SELECT email FROM users
        WHERE id IN (${userIdsToNotify})
    `)

    const subject = `[${task.project_name} ${taskId.toString().padStart(6, '0')}]: ${comment.user} commented on [${task.type}] ${task.category ? '[' + task.category + ']' : ''} ${task.title}`

    const style = `
        white-space: pre-line;
        border: 1px solid #d4d4d4;
        display: inline-block;
        padding: 8px;
    `

    const body = `
        ${comment.user} says:
        <br>
        <div style="${style}">${comment.comment !== null ? comment.comment : 'Attachment'}</div>
        <br><br>
        Click <a href="SUBSTITUTE_APP_URL/task/${taskId}">here</a> to view the task
    `

    for(const userToNotify of usersToNotify) {
        sendMail(
            userToNotify.email,
            subject,
            body,
            task.project_id
        )
    }
}

async function notifyOnTaskStatusChange(taskId, userIdOfUserWhoChangedStatus, fromTaskStatus, toTaskStatus, userIdsToNotify) {

    let task = await dbQuery(`
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

    if(task.length > 0) {
        task = task[0]
    } else {
        return
    }

    let userWhoChangedStatus = await dbQuery(`
        SELECT name FROM users
        WHERE id = ?
    `, [userIdOfUserWhoChangedStatus])

    if(userWhoChangedStatus.length > 0) {
        userWhoChangedStatus = userWhoChangedStatus[0].name
    } else {
        return
    }

    const usersToNotify = await dbQuery(`
        SELECT email FROM users
        WHERE id IN (${userIdsToNotify})
    `)

    const subject = `[${task.project_name} ${taskId.toString().padStart(6, '0')}]: ${userWhoChangedStatus} changed status of [${task.type}] ${task.category ? '[' + task.category + ']' : ''} ${task.title} from ${fromTaskStatus} to ${toTaskStatus}`

    const body = `Click <a href="SUBSTITUTE_APP_URL/task/${taskId}">here</a> to view the task`

    for(const userToNotify of usersToNotify) {
        sendMail(
            userToNotify.email,
            subject,
            body,
            task.project_id
        )
    }
}

module.exports = {
    notifyOnTaskComment,
    notifyOnTaskStatusChange
}
