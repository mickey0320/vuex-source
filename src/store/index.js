import Vue from "vue";
import Vuex from "../vuex/index";

Vue.use(Vuex);

function persist(store) {
  const local = localStorage.getItem("VUEX:STATE");
  if (local) {
    store.replaceState(JSON.parse(local));
  }
  store.subscribe(({ mutation, type }, state) => {
    localStorage.setItem("VUEX:STATE", JSON.stringify(state));
  });
}

export default new Vuex.Store({
  plugins: [persist],
  state: {
    age: 1,
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
    setAge({ commit }, payload) {
      commit("setAge", payload);
    },
  },
  modules: {
    a: {
      namespaced: true,
      state: { age: 1 },
      mutations: {
        setAge(state, payload) {
          state.age = payload;
        },
      },
    },
    b: {
      state: { age: 2 },
    },
    c: {
      state: { a: 5 },
      modules: {
        c1: {
          state: { age: 3 },
        },
        c2: {
          state: { age: 4 },
        },
      },
    },
  },
});
