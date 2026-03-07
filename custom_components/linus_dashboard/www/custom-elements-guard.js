// Patch customElements.define to be idempotent.
// Lovelace resources from this integration load before HACS resources, so any lib
// bundled here registers its elements first. When HACS then tries to re-register
// the same elements, the standard API throws a DOMException. This patch silently
// skips re-registrations, preventing console errors regardless of load order.
(function () {
  const _define = customElements.define.bind(customElements);
  customElements.define = function (name, constructor, options) {
    if (!customElements.get(name)) {
      _define(name, constructor, options);
    }
  };
})();
