import { createApp } from "vue";
import App from "./App.vue";

// load TailwindCSS
import './global.css';

const app = createApp(App);
app.mount("#app");