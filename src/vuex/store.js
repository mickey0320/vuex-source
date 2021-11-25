import ModuleCollection from "./module/module-collection";
import applyMixin from "./mixin";
import { forEach } from "./util";
export let Vue;

function installModule(store, rootState, path, module) {
  if (path.length > 0) {
    const parent = path.slice(0, -1).reduce((memo, moduleName) => {
      return memo[moduleName];
    }, rootState);
    // parent[path[path.length - 1]] = module.state
    Vue.set(parent, path[path.length - 1], module.state);
  }
  module.forEachMutations((mutation, key) => {
    store._mutations[key] = store._mutations || [];
    store._mutations[key].push((payload) => {
      mutation.call(store, module.state, payload);
    });
  });
  module.forEachActions((action, key) => {
    store._actions[key] = store._actions || [];
    store._actions[key].push((payload) => {
      action.call(store, store, payload);
    });
  });
  module.forEachGetters((getter, key) => {
    store._wrappedGetters[key] = function () {
      return getter(module.state);
    };
  });
  module.forEachChildren((childModule, key) => {
    installModule(store, rootState, [...path, key], childModule);
  });
}

function resetStoreVm(store, state) {
  const _wrappedGetters = store._wrappedGetters;
  const computed = {};
  store.getters = {};
  forEach(_wrappedGetters, (getter, key) => {
    computed[key] = () => {
      return getter();
    };
    Object.defineProperty(store.getters, key, {
      get() {
        return store._vm[key];
      },
    });
  });
  store._vm = new Vue({
    data: {
      $$state: state,
    },
    computed,
  });
}
export class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options);
    const state = this._modules.root.state;
    this._mutations = {};
    this._actions = {};
    this._wrappedGetters = {};
    installModule(this, state, [], this._modules.root);

    resetStoreVm(this, state);
  }
  commit(type, payload) {
    this._mutations[type].forEach((mutation) => {
      mutation.call(this, payload);
    });
  }
  dispatch(type, payload) {
    this._actions[type].forEach((action) => {
      action.call(this, store, payload);
    });
  }
  get state() {
    return this._vm._data.$$state;
  }
}

export function install(_Vue) {
  Vue = _Vue;
  applyMixin(Vue);
}
