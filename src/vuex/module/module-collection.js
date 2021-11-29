import Module from "./module";
import { forEach } from "../util";

class ModuleCollection {
  constructor(rootModule) {
    this.root = null;
    this.register([], rootModule);
  }
  register(path, currentModule) {
    const newModule = new Module(currentModule);
    if (!this.root) {
      this.root = newModule;
    } else {
      const parent = path.slice(0, -1).reduce((memo, childModuleName) => {
        return memo.getChild(childModuleName);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    forEach(currentModule.modules, (childModule, moduleName) => {
      this.register([...path, moduleName], childModule);
    });
  }
  getNamespace(path) {
    let module = this.root;
    return path.reduce((namespace, key) => {
      module = module.getChild(key);
      return namespace + (module.namespaced ? key + "/" : "");
    }, "");
  }
}

export default ModuleCollection;
