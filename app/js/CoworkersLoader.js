const {Coworker} = require('./Coworkers')

class CoworkersLoader {
    constructor(states) {
        this.states = states
    }

    load() {
        // TODO Use real users received from an API call
        const coworkers = [
            {
                name: 'John Thomas',
                nickname: 'jthomas',
                hipchatId: 'Nick',
                state: 'state-available'
            },
            {
                name: 'Jane Doe',
                nickname: 'jdoe',
                hipchatId: 'Nick',
                state: 'state-busy'
            },
            {
                name: 'Jonny Allaway',
                nickname: 'jallaway',
                hipchatId: 'Nick',
                state: 'state-away'
            },
            {
                name: 'Bruce Willis',
                nickname: 'bwillis',
                hipchatId: 'Nick',
                state: 'state-available'
            },
            {
                name: 'Bruce Wayne',
                nickname: 'bwayne',
                hipchatId: 'Nick',
                state: 'state-away'
            }
        ]

        return coworkers.map(coworkerData => this.buildCoworker(coworkerData))
    }

    buildCoworker(data) {
        return new Coworker(data.name, data.nickname, data.hipchatId, this.states.get(data.state))
    }
}

module.exports.CoworkersLoader = CoworkersLoader
