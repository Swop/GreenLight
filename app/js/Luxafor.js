const HID = require('node-hid')
const {ipcMain} = require('electron')

class Luxafor {
    constructor() {
        this.colors = {
            off: {r:0, g:0, b:0},

            red: {r:255, g:0, b:0},
            green: {r:0, g:255, b:0},
            orange: {r:255, g:157, b:0},
            blue: {r:0, g:0, b:255},
            white: {r:255, g:255, b:255}
        }

        this.endpoint = null
    }

    init(usbPath = null) {
        if (null === usbPath) {
            usbPath = this.discoverDevice()
        }

        if (null !== usbPath) {
            this.endpoint = new HID.HID(usbPath)

            ipcMain.on('state-change', newState => {
                this.setColor(newState.luxaforColor)
            })
        }
    }

    setRGBColor(r, g, b) {
        if (null !== this.endpoint) {
            this.endpoint.write([0x00, 2, 0xFF, r, g, b, 1])
        }
    }

    setColor(color) {
        this.setRGBColor(this.colors[color].r, this.colors[color].g, this.colors[color].b)
    }

    switchOff() {
        this.setColor('off')
    }

    discoverDevice() {
        const devices = HID.devices()

        for (let i in devices) {
            const device = devices[i]

            if (device.product === 'LUXAFOR') {
                return device.path
            }
        }

        return null
    }
}

module.exports.Luxafor = Luxafor
