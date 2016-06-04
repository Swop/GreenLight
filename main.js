const electron = require('electron')
const path = require('path')

const {app} = electron
const {BrowserWindow} = electron
const {Tray} = electron
const {Menu} = electron

let appTray = null

app.on('ready', () => {
    appTray = new Tray(path.join(__dirname, 'app/img/iconTemplate.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: () => {
                appTray.destroy()
                app.quit()
            }
        }
    ])

    appTray.setToolTip('GreenLight')
    appTray.setContextMenu(contextMenu)

    new BrowserWindow({
        width: 400, height: 225, show: false
    })
})
