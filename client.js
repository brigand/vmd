const highlightjs = require('highlight.js')
const marked = require('marked')
const remote = require('remote')
const ipc = require('ipc')
const conf = remote.getGlobal('conf')

marked.setOptions({
  highlight: function (code, lang) {
    return highlightjs.highlightAuto(code, [ lang || 'plain' ]).value
  }
})

ipc.on('md', function (raw) {
  try {
    const md = marked(raw)
    const base = document.querySelector('base')
    const body = document.querySelector('.markdown-body')
    base.setAttribute('href', remote.getGlobal('baseUrl'))
    body.innerHTML = md
  } catch (e) {
    document.body.style.color = 'white'
    document.body.style.background = 'red'

    const errorTitle = document.createElement('h1')
    errorTitle.textContent = e.type + ': ' + e.message
    errorTitle.style.fontSize = '20px'
    errorTitle.style.margin = '1em 0.5em'
    document.body.appendChild(errorTitle)

    const errorBody = document.createElement('pre')
    errorBody.textContent = e.stack
    errorBody.style.fontSize = '14px'
    errorBody.style.margin = '0 0.5em'
    errorBody.style.whiteSpace = 'pre-wrap'
    document.body.appendChild(errorBody)
  }
})

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 27) remote.getCurrentWindow().close()
})

var zoom = require('./zoom')(conf.zoom)

// menu
var vmdSubmenu = [
  { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function () { remote.require('app').quit() } }
]

if (process.platform === 'darwin') {
  vmdSubmenu = [
    { label: 'About vmd', selector: 'orderFrontStandardAboutPanel:' },
    { type: 'separator' }
  ].concat(vmdSubmenu)
}

var template = [
  {
    label: 'vmd',
    submenu: vmdSubmenu
  },
  {
    label: 'File',
    submenu: [
      { label: 'Print', accelerator: 'CmdOrCtrl+P', click: function () { window.print() } }
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: function () { zoom.zoomIn() } },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: function () { zoom.zoomOut() } },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: function () { zoom.reset() } }
    ]
  }
]

var Menu = remote.require('menu')
Menu.setApplicationMenu(Menu.buildFromTemplate(template))
