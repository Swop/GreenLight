const {ipcMain, app} = require('electron')
const notifier = require('node-notifier')
const path = require('path')

class Pomodoro {
    constructor(states) {
        this.states = states
        this.pomodoroState = 'off'
        this.pomodoroCount = 0

        if (app.debug) {
            this.pomodoroDuration = 1/6
            this.shortBreakDuration = 1/12
            this.longBreakDuration = 1/6
        } else {
            this.pomodoroDuration = 25
            this.shortBreakDuration = 5
            this.longBreakDuration = 15
        }

        this.pomodoroBeforeLongBreak = 4

        this.pomodoroRemainingTime = 0
        this.breakRemainingTime = 0
        this.pomodoroTimer = null
        this.breakTimer = null
        this.phaseTimer = null
    }

    startCylce() {
        this.pomodoroCount = 0
        this.startPomodoro()
    }

    startPomodoro() {
        this.pomodoroState = 'pomodoro'
        this.pomodoroRemainingTime = this.pomodoroDuration * 60

        this.notify('Pomodoro started! ' + this.pomodoroDuration + ' minutes to go...', 'pomodoro.png')

        ipcMain.emit('state-change', this.states.get('state-busy'))

        this.pomodoroTimer = this.startTicking(this.pomodoroTimer, this.pomodoroRemainingTime)
        this.phaseTimer = setTimeout(() => {
            this.pomodoroCount += 1
            setTimeout(() => {
                if (this.pomodoroCount === this.pomodoroBeforeLongBreak) {
                    this.startLongBreak()
                } else {
                    this.startShortBreak()
                }
            }, 500)
        }, this.pomodoroDuration * 60 * 1000)
    }

    startShortBreak() {
        this.pomodoroState = 'short_break'
        this.breakRemainingTime = this.shortBreakDuration * 60

        ipcMain.emit('state-change', this.states.get('state-available'))
        this.notify('Time for a short break! ' + this.shortBreakDuration + ' minutes to go grab a coffee...', 'pomodoro_short_break.png')

        this.breakTimer = this.startTicking(this.breakTimer, this.breakRemainingTime)
        this.phaseTimer = setTimeout(() => {
            setTimeout(() => {
                this.startPomodoro()
            }, 500)
        }, this.shortBreakDuration * 60 * 1000)
    }

    startLongBreak() {
        this.pomodoroState = 'long_break'
        this.breakRemainingTime = this.longBreakDuration * 60

        ipcMain.emit('state-change', this.states.get('state-away'))
        this.notify('Finally the long break! Get up and enjoy your ' + this.shortBreakDuration + ' minutes...', 'pomodoro_long_break.png')

        this.breakTimer = this.startTicking(this.breakTimer, this.breakRemainingTime)
        this.phaseTimer = setTimeout(() => {
            setTimeout(() => {
                this.startCylce()
            }, 500)
        }, this.longBreakDuration * 60 * 1000)
    }

    stop() {
        if (this.pomodoroState == 'off') {
            return
        }

        clearInterval(this.pomodoroTimer)
        clearInterval(this.breakTimer)
        clearTimeout(this.phaseTimer)

        this.pomodoroState = 'off'
    }

    pause() {
        clearInterval(this.pomodoroTimer)
        clearInterval(this.breakTimer)
        clearTimeout(this.phaseTimer)
    }

    resume() {
        switch (this.pomodoroState) {
        case 'pomodoro':
            ipcMain.emit('state-change', this.states.get('state-busy'))
            break
        }
    }

    startTicking(timer, remainingTime) {
        ipcMain.emit('pomodoro-tick', remainingTime)

        timer = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timer)
                return
            }

            remainingTime -= 1
            ipcMain.emit('pomodoro-tick', remainingTime)
        }, 1 * 1000)

        return timer
    }

    notify(message, image) {
        notifier.notify({
            'title': 'Pomodoro',
            'message': message,
            'icon': path.join(__dirname, '../img/' + image),
            'wait': true
        })
    }
}

module.exports.Pomodoro = Pomodoro
