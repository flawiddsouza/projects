import { format, parseISO } from 'date-fns'

const displayDateTimeFormat = 'dd-MMM-yy hh:mm a'

export default function formatDate(dateTime) {
    return format(parseISO(dateTime), displayDateTimeFormat)
}
