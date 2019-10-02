const urlRegex = /https?:\/\/\S*/g

export default function urlifyText(text) {
    return text.replace(urlRegex, url => `<a target="_blank" href="${url}">${url}</a>`)
}
