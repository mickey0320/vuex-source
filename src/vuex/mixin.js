function applyMixin(Vue) {
  Vue.mixin({
    beforeCreate: mixinInit,
  });
}

function mixinInit() {
  if (this.$options.store) {
    this.$store = this.$options.store;
  } else {
    if (this.$parent && this.$parent.$store) {
      this.$store = this.$parent.$store;
    }
  }
}

export default applyMixin;
