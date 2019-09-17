import { format, parseISO } from 'date-fns'

const displayDateFormat = 'dd-MMM-yy'

export default function formatDate(date) {
    return format(parseISO(date), displayDateFormat)
}
