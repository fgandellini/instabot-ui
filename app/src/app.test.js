import { App } from './app'

import xs from 'xstream'
import assert from 'assert'
import xsAdapter from '@cycle/xstream-adapter'
import { mockDOMSource } from '@cycle/dom'

// const inputMock = (c, value) => ({ [c]: { input: xs.of({target: { value }}) } })
// const buttonMock = (c, value) => ({ [c]: { click: xs.of({target: {}}) } })

describe('App', () => {
  const DOM = mockDOMSource(xsAdapter, {
    'input.tagList': { input: xs.of({target: {}}) },
    'input.likePerDay': { input: xs.of({target: {}}) },
    'button': { click: xs.of({target: {}}) },
  })

  const io = { get: () => xs.of({}) }

  it('should have DOM driver', done => {
    const app = App({ DOM, io })
    app.DOM.addListener({
      next: DOM => assert(DOM),
      error: done,
      complete: done
    })
  })

  it('should have io driver', done => {
    const app = App({ DOM, io })
    app.io.addListener({
      next: io => assert(io),
      error: done,
      complete: done
    })
  })
})
