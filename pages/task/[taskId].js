import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Page from 'Components/Page'
import TaskView from 'Components/TaskView'
import api from 'Libs/esm/api'
import Link from 'next/link'
import Router from 'next/router'

function Task() {

    const [ taskDoesNotExist, setTaskDoesNotExist ] = useState(false)
    const [ task, setTask ] = useState(null)
    const [ taskTypes, setTaskTypes ] = useState([])
    const [ taskStatuses, setTaskStatuses ] = useState([])
    const [ projectCategories, setProjectCategories ] = useState([])
    const [ taskPriorities, setTaskPriorities ] = useState([])
    const [ isAdmin, setIsAdmin ] = useState(false)
    const router = useRouter()
    const { taskId } = router.query

    async function fetchTask() {
        const response = await api.get(`task/${taskId}`).json()
        if(response.status === 'error') {
            setTaskDoesNotExist(true)
        } else {
            setTask(response.task)
            setTaskTypes(response.taskTypes)
            setTaskStatuses(response.taskStatuses)
            setProjectCategories(response.projectCategories)
            setTaskPriorities(response.taskPriorities)
            fetchIsAdmin(response.task)
        }
    }

    async function fetchIsAdmin(task) {
        const isAdmin = await api.get(`${task.organization_slug}/is-admin`).json()
        setIsAdmin(isAdmin)
    }

    async function deleteTask(e) {
        e.preventDefault()
        if(confirm('Are you sure you want to delete this task? All its contents will be lost forever. Continue?')) {
            let answer = prompt('Type \'yes\' to confirm')
            if(answer === 'yes') {
                await api.delete(`task/${taskId}`)
                Router.push(`/${task.organization_slug}#project:${task.project_slug}`)
            }
        }
    }

    useEffect(() => {
        fetchTask()
    }, [])

    return (
        <Page>
            <Page.Nav>
                {
                    !taskDoesNotExist && task &&
                    <div>
                        <Link href="/[organization]" as={`/${task.organization_slug}`}><a className="c-i">{task.organization_name}</a></Link>
                        <span> > </span>
                        <Link href="/[organization]" as={`/${task.organization_slug}#project:${task.project_slug}`}><a className="c-i">{task.project_name}</a></Link>
                    </div>
                }
                <div>
                    <select className="v-h"></select>
                    {
                        isAdmin && !task.completed &&
                        <a href="#" className="c-i" onClick={deleteTask}>Delete Task</a>
                    }
                </div>
            </Page.Nav>
            <Page.Sidebar></Page.Sidebar>
            <Page.Content>
                {
                    !taskDoesNotExist && task ?
                        <TaskView task={task} taskStatuses={taskStatuses} taskTypes={taskTypes} projectCategories={projectCategories} taskPriorities={taskPriorities} refreshTasks={fetchTask} tabsContentHeight="calc(100vh - 15.5em)" width="100%"></TaskView>
                    :
                        <div>Task Does Not Exist</div>
                }
            </Page.Content>
        </Page>
    )
}

Task.getInitialProps = () => ({})

export default Task
