"use client"
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/client/index.tsx
import { utcToZonedTime } from "date-fns-tz";
import {
  createContext,
  useContext,
  useReducer
} from "react";

// src/shared/index.ts
function mapStringsToDates(slots) {
  return slots.map(({ start, end }) => ({
    start: new Date(start),
    end: new Date(end)
  }));
}

// src/client/index.tsx
import { jsx } from "react/jsx-runtime";
var INITIAL_STATE = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  date: /* @__PURE__ */ new Date(),
  availability: [],
  dialog: false,
  duration: 30
};
var AvailabilityContext = createContext({
  dispatch: () => null,
  state: INITIAL_STATE
});
function AvailabilityProvider({
  children,
  data
}) {
  const dataAsDates = mapStringsToDates(data);
  const [state, dispatch] = useReducer(reducer, __spreadProps(__spreadValues({}, INITIAL_STATE), {
    availability: dataAsDates
  }));
  function reducer(state2, action) {
    switch (action.type) {
      case "set_date":
        return __spreadProps(__spreadValues({}, state2), {
          date: action.payload
        });
      case "set_timezone":
        return __spreadProps(__spreadValues({}, state2), {
          timeZone: action.payload
        });
      case "set_dialog": {
        return __spreadProps(__spreadValues({}, state2), {
          dialog: action.payload
        });
      }
      case "set_duration": {
        return __spreadProps(__spreadValues({}, state2), {
          duration: action.payload
        });
      }
      default:
        return state2;
    }
  }
  return /* @__PURE__ */ jsx(AvailabilityContext.Provider, { value: { dispatch, state }, children });
}
function useAvailabilityContext() {
  if (!useContext(AvailabilityContext))
    throw new Error(
      "AvailabilityContext is not defined. Did you forget to wrap your component in AvailabilityProvider?"
    );
  return useContext(AvailabilityContext);
}
export {
  AvailabilityProvider,
  useAvailabilityContext
};
//# sourceMappingURL=index.js.map