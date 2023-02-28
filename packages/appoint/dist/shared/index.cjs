"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/shared/index.ts
var shared_exports = {};
__export(shared_exports, {
  mapDatesToStrings: () => mapDatesToStrings,
  mapStringsToDates: () => mapStringsToDates
});
module.exports = __toCommonJS(shared_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mapDatesToStrings,
  mapStringsToDates
});
//# sourceMappingURL=index.cjs.map