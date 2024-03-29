import Vue from "vue";
import Vuex from "vuex";
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cryptoids: [],
    currentCryptoid: null,
    currentGalaxy: null,
    galaxies: [],
    inventory: {
      items: [],
      worlds: [],
    },
    rocket: null,
    showInventory: false,
    totalCryptoids: null
  },
  mutations,
  actions,
  modules: {},
});
