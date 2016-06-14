const electron = require('electron')
const path = require('path')

const {app, Tray, Menu, MenuItem, ipcMain} = electron

class AppTray {
    constructor(coworkers, states, pomodoro) {
        this.states = states
        this.coworkers = coworkers
        this.pomodoro = pomodoro

        this.appTray = new Tray(path.join(__dirname, '../img/iconTemplate.png'))
        this.appTray.setToolTip(app.getName())

        this.reloadMenu()

        ipcMain.on('state-change', newState => this.changeState(newState))
        ipcMain.on('coworkers-reload', () => { this.reloadMenu() })
        ipcMain.on('add-pinned-coworker', () => { this.reloadMenu() })
        ipcMain.on('removed-pinned-coworker', () => { this.reloadMenu() })
        ipcMain.on('pomodoro-tick', remaningTime => { this.displayRemainingTime(remaningTime) })
    }

    reloadMenu() {
        this.stateMenuItems = {}

        this.appTrayMenu = new Menu()

        // Own availability state
        this.appTrayMenu.append(new MenuItem({label: 'Curent state:', enabled: false}))
        this.appendStatesInMenu(this.appTrayMenu)

        this.appTrayMenu.append(new MenuItem({type: 'separator'}))

        this.appTrayMenu.append(new MenuItem({label: 'Pomodoro:', enabled: false}))

        if (this.pomodoro.pomodoroState == 'off') {
            this.appTrayMenu.append(new MenuItem({label: 'Start pomodoro', click: () => {
                this.pomodoro.startCylce()
                this.reloadMenu()
            }}))
        } else {
            this.appTrayMenu.append(new MenuItem({label: 'Stop pomodoro', click: () => {
                this.pomodoro.stop()
                this.appTray.setTitle('')
                ipcMain.emit('state-change', this.states.get('state-available'))
                this.reloadMenu()
            }}))
        }

        this.appTrayMenu.append(new MenuItem({type: 'separator', id:'pinned-group'}))

        // Pinned coworkers availability states
        this.appTrayMenu.append(new MenuItem({label: 'Pinned coworkers:', enabled: false}))
        const pinnedCoworkers = this.coworkers.allPinned()
        this.addCoworkersInMenu(this.appTrayMenu, pinnedCoworkers, 'endof=pinned-group')

        this.appTrayMenu.append(new MenuItem({type: 'separator'}))
        // All coworkers availability states
        this.allCoworkersMenu = new Menu()
        const coworkers = this.coworkers.all()
        this.addCoworkersInMenu(this.allCoworkersMenu, coworkers)
        this.appTrayMenu.append(new MenuItem({label: 'All coworkers', submenu: this.allCoworkersMenu}))

        this.appTrayMenu.append(new MenuItem({type: 'separator'}))

        // Quit
        this.appTrayMenu.append(new MenuItem({label: 'Quit', accelerator: 'Command+Q', click: () => ipcMain.emit('quit-app')}))

        this.appTray.setContextMenu(this.appTrayMenu)
    }

    appendStatesInMenu(menu) {
        const states = this.states.all()

        for (const i in states) {
            const state = states[i]
            let menuItem = new MenuItem({
                label: state.label,
                type: 'radio',
                icon: state.icon,
                checked: false,
                click: () => {
                    ipcMain.emit('state-change', state)
                }
            })

            this.stateMenuItems[state.name] = menuItem
            menu.append(menuItem)
        }
    }

    reloadAllCoworkersMenu() {
        const coworkers = this.coworkers.all()
        this.addCoworkersInMenu(this.allCoworkersMenu, coworkers)
    }

    reloadPinnedCoworkersMenu() {
        const coworkers = this.coworkers.allPinned()
        this.addCoworkersInMenu(this.allCoworkersMenu, coworkers, 'endof=pinned-group')
    }

    addCoworkersInMenu(menu, coworkers, position = null) {
        for (const i in coworkers) {
            const coworker = coworkers[i]
            let template = {label: coworker.name, icon: coworker.state.icon}
            if (null !== position) {
                template.position = position
            }
            template.click = () => {
                coworker.openPrivateRoomOnHipchat()
            }
            menu.append(new MenuItem(template))
        }
    }

    changeState(newState) {
        this.appTray.setImage(newState.icon)
        this.stateMenuItems[newState.name].checked = true
    }

    displayRemainingTime(remainingTime) {
        this.appTray.setTitle(this.formatTime(remainingTime))
    }

    formatTime(time) {
        const sec_num = parseInt(time, 10)

        let hours   = Math.floor(sec_num / 3600)
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60)
        let seconds = sec_num - (hours * 3600) - (minutes * 60)

        if (hours < 10) { hours   = '0' + hours }
        if (minutes < 10) { minutes = '0' + minutes }
        if (seconds < 10) { seconds = '0' + seconds }

        return (hours !== '00' ? hours + ':' : '') + minutes + ':' + seconds
    }
}

module.exports.AppTray = AppTray
