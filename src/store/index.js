import Vue from "vue";
import Vuex from "../vuex/index";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    age: 100,
  },
  getters: {
    getAge(state) {
      return state.age + 10;
    },
  },
  mutations: {
    setAge(state, payload) {
      state.age = state.age + payload;
    },
  },
  actions: {
    setAge({ commit }) {},
  },
  modules: {
    a: {},
    b: {},
    c: {
      modules: {
        c1: {},
        c2: {},
      },
    },
  },
});
