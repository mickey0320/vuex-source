import ModuleCollection from "./module/module-collection";
import applyMixin from "./mixin";
import { forEach } from "./util";
export let Vue;

function getState(rootState, path) {
  return path.reduce((state, key) => {
    return state[key];
  }, rootState);
}

function installModule(store, rootState, path, module) {
  const namespace = store._modules.getNamespace(path);
  if (path.length > 0) {
    const parent = path.slice(0, -1).reduce((memo, moduleName) => {
      return memo[moduleName];
    }, rootState);
    Vue.set(parent, path[path.length - 1], module.state);
  }
  module.forEachMutations((mutation, key) => {
    store._mutations[namespace + key] = store._mutations[namespace + key] || [];
    store._mutations[namespace + key].push((payload) => {
      mutation.call(store, getState(store.state, path), payload);
      store._subscribs.forEach((subscribe) =>
        subscribe({ mutation, type: key }, store.state)
      );
    });
  });
  module.forEachActions((action, key) => {
    store._actions[namespace + key] = store._actions[namespace + key] || [];
    store._actions[namespace + key].push((payload) => {
      action.call(store, store, payload);
    });
  });
  module.forEachGetters((getter, key) => {
    store._wrappedGetters[namespace + key] = function () {
      return getter(getState(store.state, path));
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
    this._subscribs = [];
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
    installModule(this, state, [], this._modules.root);
    resetStoreVm(this, state);
    (options.plugins || []).forEach((plugin) => plugin(this));
  }
  commit(type, payload) {
    this._mutations[type].forEach((mutation) => {
      mutation.call(this, payload);
    });
  }
  dispatch(type, payload) {
    this._actions[type].forEach((action) => {
      action.call(this, payload);
    });
  }
  get state() {
    return this._vm._data.$$state;
  }
  resiterModule(path, rawModule) {
    if (typeof path === "string") {
      path = [path];
    }
    this._modules.register(path, rawModule);
    installModule(this, this._modules.root.state, path, rawModule.newModule);
    resetStoreVm(this, this._modules.root.state);
  }
  subscribe(fn) {
    this._subscribs.push(fn);
  }
  replaceState(newState) {
    this._vm._data.$$state = newState;
  }
}

export function install(_Vue) {
  Vue = _Vue;
  applyMixin(Vue);
}
