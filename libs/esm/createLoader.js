export default function createLoader(loaderMessage) {
    let loader = document.createElement('div')
    loader.style.cssText = `
        position: fixed;
        background-color: #00000036;
        height: 100vh;
        width: 100vw;
        z-index: 1000;
        top: 0;
    `
    loader.innerHTML = `
        <div style="height: 100vh; display: flex; justify-content: center; align-items: center; color: white; font-size: 2em;">${loaderMessage}</div>
    `
    document.body.appendChild(loader)
    return loader
}
