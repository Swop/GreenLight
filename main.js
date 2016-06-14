const electron = require('electron')
const {AppTray} = require('./app/js/AppTray')
const {Coworkers} = require('./app/js/Coworkers')
const {CoworkersLoader} = require('./app/js/CoworkersLoader')
const {States} = require('./app/js/States')
const {Luxafor} = require('./app/js/Luxafor')
const {Pomodoro} = require('./app/js/Pomodoro')
const {BrowserWindow, ipcMain} = electron
const {app} = electron

app.setName('GreenLight')

const states = new States()

let pinned = ['jdoe'] // TODO Get favorites from configuration
const coworkers = new Coworkers(new CoworkersLoader(states), pinned)

const luxafor = new Luxafor()
luxafor.init()
const pomodoro = new Pomodoro(states)

app.on('ready', () => {
    ipcMain.on('quit-app', () => app.quit())

    new AppTray(coworkers, states, pomodoro)
    coworkers.reload()
    ipcMain.emit('state-change', states.get('state-available'))

    new BrowserWindow({
        width: 400, height: 225, show: false
    })
})

app.on('quit', () => {
    if (null !== luxafor) {
        luxafor.switchOff()
    }
})
