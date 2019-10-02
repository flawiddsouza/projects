import { useState, useEffect } from 'react'
import formatDateTime from 'Libs/formatDateTime.js'

export default function TaskViewFiles({ setFilesCount }) {
    const [ files, setFiles ] = useState([])

    useEffect(() => {
        setFiles([
            {
                id: 1,
                filename: 'agnes_pacifyca_data.sql',
                size: '129.2 MB',
                created_at: '2019-09-01 16:31:00'
            },
            {
                id: 2,
                filename: 'agnes_pacifyca_structure.sql',
                size: '274.5 KB',
                created_at: '2019-09-10 13:12:00'
            }
        ])
    }, [])

    useEffect(() => {
        setFilesCount(files.length)
    }, [files])

    return (
        <div className="oy-a" style={{ maxHeight: '23.2em' }}>
            <table className="table table-comfortable">
                <tbody>
                {
                    files.map(file =>
                        <tr key={file.id}>
                            <td style={{ width: '9.3em' }}>{formatDateTime(file.created_at)}</td>
                            <td><a href={`static/attachments/${file.filename}`} target="_blank">{file.filename}</a></td>
                            <td style={{ width: '5em' }}>{file.size}</td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        </div>
    )
}
