const electron = require('electron')
const {ipcMain, shell} = electron

class Coworkers {
    constructor(coworkersLoader, pinned = []) {
        this.coworkersLoader = coworkersLoader
        this.collection = {}
        this.pinned = pinned
    }

    reload() {
        const coworkers = this.coworkersLoader.load()
        this.collection = coworkers.reduce((collection, coworker) => {
            collection[coworker.nickname] = coworker
            return collection
        }, {})
        ipcMain.emit('coworkers-reload')
    }

    addPinned(coworkerNickName) {
        const coworker = this.get(coworkerNickName)
        if (null === coworker) {
            return
        }

        const index = this.pinned.indexOf(coworkerNickName)

        if (index == -1) {
            this.pinned.push(coworkerNickName)
            ipcMain.emit('add-pinned-coworker', this.get(coworkerNickName))
        }
    }

    removePinned(coworkerNickName) {
        const coworker = this.get(coworkerNickName)
        if (null === coworker) {
            return
        }

        const index = this.pinned.indexOf(coworkerNickName)

        if (index > -1) {
            this.pinned.splice(index, 1)
            ipcMain.emit('remove-pinned-coworker', coworker)
        }
    }

    get(coworkerNickName) {
        this.collection.hasOwnProperty(coworkerNickName) ? this.collection[coworkerNickName] : null
    }

    all() {
        // return this.collection
        let coworkers = Object.keys(this.collection).map(nickname => this.collection[nickname])

        this.sortCoworkers(coworkers)

        return coworkers
    }

    allPinned() {
        let coworkers = this.collection

        let pinnedItems = this.pinned
            .map(nickname => coworkers.hasOwnProperty(nickname) ? coworkers[nickname] : null)
            .filter(coworker => null !== coworker)

        this.sortCoworkers(pinnedItems)

        return pinnedItems
    }

    sortCoworkers(coworkers) {
        coworkers.sort((a, b) => a.compareTo(b))
    }
}

class Coworker {
    constructor(name, nickname, hipchatId, state) {
        this.name = name,
        this.nickname = nickname,
        this.hipchatId = hipchatId
        this.state = state
    }

    openPrivateRoomOnHipchat() {
        const hipChatDomain = 'alittle'
        const url = 'hipchat://' + hipChatDomain + '.hipchat.com/user/@'+this.hipchatId

        shell.openExternal(url)
    }

    compareTo(otherCoworker) {
        const stateComparison = this.state.compareTo(otherCoworker.state)

        if (0 !== stateComparison) {
            // If the two coworker arn't in the same state, the sort is made on the state value
            return stateComparison
        }

        // If not, the sort is made on the coworker names
        var name = this.name.toUpperCase()
        var otherName = otherCoworker.name.toUpperCase()

        if (name < otherName) {
            return -1
        }

        if (name > otherName) {
            return 1
        }

        return 0
    }
}

module.exports = {
    Coworkers: Coworkers,
    Coworker: Coworker
}
