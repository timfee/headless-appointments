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
export {
  mapDatesToStrings,
  mapStringsToDates
};
//# sourceMappingURL=index.js.map