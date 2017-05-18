import io from 'socket.io-client'
import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeSocketIODriver } from 'cycle-socket.io'
import { App } from './app'

const main = App

const drivers = {
  DOM: makeDOMDriver('#app'),
  io: makeSocketIODriver(io(document.location.origin.replace(/:\d+$/, ''))),
}

run(main, drivers)
