import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
axios.defaults.withCredentials=true  //允许http请求携带cookie
axios.defaults.crossDomain=true;   //允许跨域访问cookie
axios.defaults.baseURL="http://192.168.14.63:3000"
Vue.prototype.$http=axios
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
