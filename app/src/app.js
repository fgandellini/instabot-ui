import { div, h1, label, input, button, span, pre } from '@cycle/dom'
import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

const field = (name, disabled, value) =>
  input(`.field .${name}`, { attrs: {
    disabled,
    value,
  }})

const buildCommand = ([toggle, tagList, likePerDay]) => ({
  messageType: 'command',
  message: {
    command: toggle ? 'start' : 'stop',
    params: { tagList, likePerDay },
  },
})

export function App(sources) {
  // Utils
  const inputStreamFor = i =>
    sources.DOM.select(i).events('input')
      .map(e => e.target.value)

  const clickStreamFor = i =>
    sources.DOM.select(i).events('click')
      .mapTo(null)

  // Intent
  const status$ = sources.io.get('bot-status')
  const log$ = sources.io.get('bot-log')
  const tagListInput$ = inputStreamFor('input.tagList')
  const likePerDayInput$ = inputStreamFor('input.likePerDay')
  const toggleClick$ = clickStreamFor('button')

  // Model
  const tagList$ = xs.merge(
    status$.map(s => s.tagList),
    tagListInput$.map(t => t.split(',')))
  const likePerDay$ = xs.merge(
    status$.map(s => s.likePerDay),
    likePerDayInput$.map(l => parseInt(l)))
  const fields$ = sampleCombine(tagList$, likePerDay$, status$)
  const toggle$ = status$.map(s => toggleClick$.map(() => !s.isActive)).flatten()
  const isFetching$ = xs.merge(
    toggle$.mapTo(true),
    status$.mapTo(false))
  const logs$ = log$.fold((logs, l) => logs.concat(l), '')

  // View
  const sinks = {
    DOM: xs.combine(isFetching$, status$, logs$)
      .map(([isFetching, bot, logs]) => div([
        h1('instabot-ui'),
          div([
            div([label('Tag list:'), field('tagList', isFetching || !!bot.isActive, bot.tagList)]),
            div([label('Like per day:'), field('likePerDay', isFetching || !!bot.isActive, bot.likePerDay)]),
            button(
              {attrs: { disabled: isFetching }},
              isFetching ? 'loading...' : !!bot.isActive ? '■' : '▶'
            ),
            pre(logs),
          ])
      ])),
    io: toggle$.compose(fields$)
      .map(buildCommand)
  }
  return sinks
}
