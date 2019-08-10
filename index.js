window.onload = function () {
  console.log('Loaded')

  window.app = {
    wsUri: 'ws://127.0.0.1:8998/',
    wsData: null,
    controllerLeft: {},
    controllerRight: {},
    connectionStatus: 'Connecting...',
    messages: [],
    messageLimit: 10,
    output: document.querySelector('#output'),

    connect: function () {
      app.addMessage('Open socket')
      app.wsData = new WebSocket(app.wsUri)
      app.wsData.onopen = app.onOpen
      app.wsData.onclose = app.onClose
      app.wsData.onerror = app.onError
      app.wsData.onmessage = app.onMessage
    },

    onOpen: function (evt) {
      app.wsData.send('mailbox_open controller_visualizer')
      app.wsData.send('mailbox_send input_server {"type":"request_input_state_updates","device_path":"/user/hand/left","returnAddress":"controller_visualizer"}')
      app.wsData.send('mailbox_send input_server {"type":"request_input_state_updates","device_path":"/user/hand/right","returnAddress":"controller_visualizer"}')
    },

    onClose: function () {
      app.connectionStatus = 'Disconnected'
      app.addMessage('Disconnected')
    },

    onError: function (evt) {
      console.log('Error:', evt)
      app.addMessage('Failed to connect')
    },

    onMessage: function (evt) {
      let msgData = JSON.parse(evt.data)

      if (typeof msgData.components === 'undefined') return

      if (app.connectionStatus === 'Connecting...') {
        app.connectionStatus = 'Connected To SteamVR'
        app.addMessage('Connected')
      }

      for (const componentData in msgData.components) {
        if (!msgData.components.hasOwnProperty(componentData)) continue
        const componentValue = msgData.components[componentData]
        let componentName = componentData.split('/')[2]
        let valueType = componentData.split('/')[3]
        let controller = {
          hand: 'left',
          data: null
        }

        if (msgData.device === '/user/hand/left') controller.data = app.controllerLeft
        else if (msgData.device === '/user/hand/right') controller = { hand: 'right', data: app.controllerRight }

        if (controller && typeof controller.data[componentName] === 'undefined') {
          app.addMessage(`${controller.hand} ${componentName} ${valueType} detected`)
          controller.data[componentName] = {}
        }
        if (controller && typeof controller.data[componentName][valueType] === 'undefined') controller.data[componentName][valueType] = 0
        controller.data[componentName][valueType] = componentValue

        if (controller && controller.hand === 'left') app.controllerLeft = controller.data
        else if (controller.hand === 'right') app.controllerRight = controller.data
      }
      app.messages.push(controllers)
      if (app.messages.length > app.messageLimit) app.messages.shift()
    },

    addMessage: function (message) {
      app.output.innerHTML += `${message}<br />`
      console.log('')
    }
  }

  app.connect()
}

