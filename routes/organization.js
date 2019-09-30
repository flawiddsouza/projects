const express = require('express')
const router = express.Router()

router.get('/projects', (req, res) => {
    if(req.organization === 'atconline') {
        res.json([
            {
                name: 'Agnes Pacifyca',
                slug: 'agnes-pacifyca'
            },
            {
                name: 'Aloysius Pacifyca',
                slug: 'aloysius-pacifyca'
            }
        ])
    } else {
        res.json([])
    }
})

router.get('/:project/fetch', (req, res) => {
    if(req.organization === 'atconline') {
        if(req.params.project === 'agnes-pacifyca') {
            let tasks = [
                {
                    id: 1,
                    date: '2019-09-12',
                    type: 'NR',
                    title: 'Test 1',
                    status: 'OPEN'
                },
                {
                    id: 2,
                    date: '2019-09-10',
                    type: 'CR',
                    title: 'Test 2',
                    status: 'OPEN'
                },
                {
                    id: 3,
                    date: '2019-09-05',
                    type: 'BUG',
                    title: 'Test 3',
                    status: 'OPEN'
                }
            ]
            let projectMembers = [
                {
                    id: 1,
                    name: 'Deepa',
                    role: 'Tester'
                },
                {
                    id: 2,
                    name: 'Flawid',
                    role: 'Team Lead'
                },
                {
                    id: 3,
                    name: 'Kavya',
                    role: 'Assistant Team Lead'
                },
                {
                    id: 4,
                    name: 'Keerthan',
                    role: 'Developer'
                },
                {
                    id: 5,
                    name: 'Ranjith',
                    role: 'Developer'
                },
                {
                    id: 6,
                    name: 'Shreekanth',
                    role: 'Developer'
                }
            ]
            res.json({
                tasks,
                projectMembers
            })
        }
        if(req.params.project === 'aloysius-pacifyca') {
            let tasks = [
                {
                    id: 4,
                    date: '2019-09-16',
                    type: 'BUG',
                    title: 'Test 4',
                    status: 'OPEN'
                },
                {
                    id: 5,
                    date: '2019-09-15',
                    type: 'BUG',
                    title: 'Test 5',
                    status: 'OPEN'
                },
                {
                    id: 6,
                    date: '2019-09-14',
                    type: 'CR',
                    title: 'Test 6',
                    status: 'OPEN'
                }
            ]
            let projectMembers = [
                {
                    id: 7,
                    name: 'Aniketh',
                    role: 'Team Lead'
                },
                {
                    id: 8,
                    name: 'Chaitra',
                    role: 'Tester'
                },
                {
                    id: 9,
                    name: 'Denzil',
                    role: 'Developer'
                },
                {
                    id: 10,
                    name: 'Sanath',
                    role: 'Developer'
                }
            ]
            res.json({
                tasks,
                projectMembers
            })
        }
    } else {
        res.json({
            tasks: [],
            projectMembers: []
        })
    }
})

module.exports = router
