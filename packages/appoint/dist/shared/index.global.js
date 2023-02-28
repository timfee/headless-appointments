"use strict";
(() => {
  // src/shared/index.ts
  function mapStringsToDates(slots) {
    return slots.map(({ start, end }) => ({
      start: new Date(start),
      end: new Date(end)
    }));
  }
  function mapDatesToStrings(slots) {
    return slots.map(({ start, end }) => ({
      start: start.toISOString(),
      end: end.toISOString()
    }));
  }
})();
//# sourceMappingURL=index.global.js.map