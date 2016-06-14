const electron = require('electron')
const path = require('path')

const {nativeImage} = electron

class States {
    constructor() {
        this.availableStates = [
            new State('state-available', 'Available', 'stateAvailableImage.png', 'stateAvailableImageColor.png', 0, 'green'),
            new State('state-away', 'Away', 'stateAwayImage.png', 'stateAwayImageColor.png', 1, 'orange'),
            new State('state-busy', 'Busy', 'stateBusyImage.png', 'stateBusyImageColor.png', 2, 'red')
        ]
    }

    all() {
        return this.availableStates
    }

    get(stateName) {
        const filteredStates = this.availableStates.filter(state => state.name === stateName)

        if (filteredStates.length > 0) {
            return filteredStates[0]
        }

        return null
    }
}

class State {
    constructor(name, label, monocromeImageName, colorImageName, sortPriority, luxaforColor) {
        this.name = name
        this.label = label
        this.icon = nativeImage.createFromPath(path.join(__dirname, '../img/' + colorImageName))
        this.monochromeIcon = nativeImage.createFromPath(path.join(__dirname, '../img/' + monocromeImageName))
        this.sortPriority = sortPriority
        this.luxaforColor = luxaforColor
    }

    compareTo(otherStatus) {
        return this.sortPriority - otherStatus.sortPriority
    }
}

module.exports.States = States
