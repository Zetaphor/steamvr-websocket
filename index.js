window.onload = function () {
  var app = new Vue({
    el: '#app',

    mounted () {
      this.connectSteamVR()
    },

    data: function () {
      return {
        wsUri: 'ws://127.0.0.1:8998/',
        wsData: null,
        controllers: { left: {}, right: {} }
      }
    },

    watch: {
      controllers: function (newVal, oldVal) {
        console.log('Update')
      }
    },

    methods: {
      connectSteamVR: function () {
        console.log('Open data socket')
        this.wsData = new WebSocket(this.wsUri)
        this.wsData.onopen = this.onOpen
        this.wsData.onclose = this.onClose
        this.wsData.onerror = this.onError
        this.wsData.onmessage = this.onMessage
      },

      onOpen: function (evt) {
        console.log("Connected")
        this.wsData.send('mailbox_open controller_visualizer')
        this.wsData.send('mailbox_send input_server {"type":"request_input_state_updates","device_path":"/user/hand/left","returnAddress":"controller_visualizer"}')
        this.wsData.send('mailbox_send input_server {"type":"request_input_state_updates","device_path":"/user/hand/right","returnAddress":"controller_visualizer"}')
      },

      onClose: function () {
        console.log("Disconnected")
      },

      onError: function (evt) {
        console.log('Error:', evt.data)
      },

      onMessage: function (evt) {
        let msgData = JSON.parse(evt.data)
        if (typeof msgData.components === 'undefined') return

        for (const componentData in msgData.components) {
          if (!msgData.components.hasOwnProperty(componentData)) continue
          const componentValue = msgData.components[componentData]
          let componentName = componentData.split('/')[2]
          let valueType = componentData.split('/')[3]
          console.log(componentData.split('/'))
          let hand = null
          if (msgData.device === '/user/hand/left') hand = 'left'
          else if (msgData.device === '/user/hand/right') hand = 'right'

          if (typeof this.controllers[hand][componentName] === 'undefined') this.controllers[hand][componentName] = {}
          if (typeof this.controllers[hand][componentName][valueType] === 'undefined') this.controllers[hand][componentName][valueType] = 0
          this.controllers[hand][componentName][valueType] = componentValue
        }
      }
    }
  })
}