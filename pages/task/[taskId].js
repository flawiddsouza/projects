import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Page from 'Components/Page'
import TaskView from 'Components/TaskView'
import api from 'Libs/esm/api'
import Link from 'next/link'

function Task() {

    const [ taskDoesNotExist, setTaskDoesNotExist ] = useState(false)
    const [ task, setTask ] = useState(null)
    const [ taskTypes, setTaskTypes ] = useState([])
    const [ taskStatuses, setTaskStatuses ] = useState([])
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
                <select className="v-h"></select>
            </Page.Nav>
            <Page.Sidebar></Page.Sidebar>
            <Page.Content>
                {
                    !taskDoesNotExist && task ?
                        <TaskView task={task} taskStatuses={taskStatuses} taskTypes={taskTypes} refreshTasks={fetchTask} tabsContentHeight="75vh" width="100%"></TaskView>
                    :
                        <div>Task Does Not Exist</div>
                }
            </Page.Content>
        </Page>
    )
}

Task.getInitialProps = () => ({})

export default Task
