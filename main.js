const electron = require('electron')
const path = require('path');

const {app} = electron;
const {BrowserWindow} = electron;
const {Tray} = electron;
const {Menu} = electron;

let mainWindow = null
let appTray = null

app.on('ready', () => {
    appTray = new Tray(path.join(__dirname, 'app/img/iconTemplate.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: (menuItem, browserWindow) => {
                appTray.destroy()
                app.quit()
              }
        }
    ])

    appTray.setToolTip('GreenLight')
    appTray.setContextMenu(contextMenu)


    mainWindow = new BrowserWindow({
        width: 400, height: 225, show: false
    })
});
