import { createApp } from 'vue'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(new VueSocketIO({
    debug: true,
    connection: SocketIO('http://localhost:3000', { autoConnect: false }), //options object is Optional
})
);
app.mount('#app')
