import { forEach } from "../util";

class Module {
  constructor(module) {
    this._raw = module;
    this._children = {};
    this.state = module.state;
  }
  getChild(key) {
    return this._children[key];
  }
  addChild(key, module) {
    this._children[key] = module;
  }
  forEachMutations(fn) {
    forEach(this._raw.mutations, (mutation, key) => {
      fn(mutation, key);
    });
  }
  forEachActions(fn) {
    forEach(this._raw.actions, (action, key) => {
      fn(action, key);
    });
  }
  forEachGetters(fn) {
    forEach(this._raw.getters, (getter, key) => {
      fn(getter, key);
    });
  }
  forEachChildren(fn) {
    forEach(this._children, (module, key) => {
      fn(module, key);
    });
  }
}

export default Module;
