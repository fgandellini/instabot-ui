const spawn = require('child_process').spawn
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const fs = require('fs')
const path = require('path')

const CONFIG_FILE = path.resolve(__dirname, 'bot-config.json')
const BOT = path.resolve(__dirname, 'bot.py')
const APP = path.resolve(__dirname, '../app/build')

const readConfig = () => 
  new Promise((resolve, reject) =>
    fs.readFile(CONFIG_FILE,
      (err, data) => {
        if (err) return reject(err)
        try {
          return resolve(JSON.parse(data))
        } catch(e) {
          return reject(e)
        }
      }
    )
  )

const writeConfig = config => 
  new Promise((resolve, reject) =>
    fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), err =>
      !err ? resolve(config) : reject(err))
  )

const startBroadcast = bot => {
  bot.stdout.on('data', data => {
    try {
      io.emit('bot-status', Object.assign({ isActive: true }, botProcessConfig))
      io.emit('bot-log', data.toString('utf8'))
    } catch (err) {
      io.emit('bot-error', 'Generic error!\n')
    }
  })

  bot.stderr.on('data', data => {
    try {
      io.emit('bot-status', Object.assign({ isActive: true }, botProcessConfig))
      io.emit('bot-error', data.toString('utf8'))
    } catch (err) {
      /* not able to report the error! :( */
    }
  })

  bot.on('error', err => {
    try {
      io.emit('bot-error', err.toString('utf8'))
    } catch (err) {
      io.emit('bot-error', 'Error executing the bot!\n')
      io.emit('bot-status', Object.assign({ isActive: false }, botProcessConfig))
    }
  })

  bot.on('close', code => {
    io.emit('bot-log', `Bot stopped (exit code ${code})!\n`)
    io.emit('bot-status', Object.assign({ isActive: false }, botProcessConfig))
  })
}

const startBot = () => {
  try {
    const bot = spawn('python', ['-u', BOT])
    startBroadcast(bot)
    return bot
  } catch(e) {
    return null
  }
}

const stopBot = bot => {
  if (bot) {
    bot.kill('SIGKILL')
  }
  return null
}

let botProcess = null
let botProcessConfig = null

const commands = {
  start: config => 
    writeConfig(config).then(config => {
      io.emit('bot-log', 'Starting bot...\n')
      botProcessConfig = config
      botProcess = stopBot(botProcess)
      botProcess = startBot()
    }),
  stop: () => {
    io.emit('bot-log', 'Stopping bot...\n')
    botProcess = stopBot(botProcess)
  }
}

io.on('connection', client => {

  // Send bot status on when a new client arrives
  readConfig().then(config => {
    io.emit('bot-status', Object.assign({ isActive: botProcess !== null }, config))
  })

  // When a client sends a command, try to execute it
  client.on('command', c => {
    try {
      commands[c.command](c.params)
    } catch(err) {
      io.emit('bot-error', `Unable to ${c.command} the bot!\n`)
    }
  })

})

app.use(express.static(APP))

server.listen(5000, '0.0.0.0')
