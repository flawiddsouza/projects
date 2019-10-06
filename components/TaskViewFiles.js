import { useState, useEffect } from 'react'
import formatDateTime from 'Libs/formatDateTime.js'
import api from 'Libs/esm/api'
import bytesToHumanReadableFileSize from 'Libs/esm/bytesToHumanReadableFileSize'

export default function TaskViewFiles({ taskId, setFilesCount }) {
    const [ files, setFiles ] = useState([])
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)

    async function fetchFiles() {
        const files = await api.get(`task/${taskId}/files`).json()
        setIntialLoadComplete(true)
        setFiles(files)
    }

    useEffect(() => {
        fetchFiles()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setFilesCount(files.length)
        }
    }, [files])

    return (
        <div className="oy-a" style={{ maxHeight: '23.2em' }}>
            <table className="table table-comfortable">
                <tbody>
                {
                    files.map(file =>
                        <tr key={file.id}>
                            <td style={{ width: '9.3em' }}>{formatDateTime(file.created_at)}</td>
                            <td><a href={`static/uploads/${file.saved_file_name}`} target="_blank">{file.original_file_name}</a></td>
                            <td style={{ width: '5em' }}>{bytesToHumanReadableFileSize(file.file_size)}</td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        </div>
    )
}
