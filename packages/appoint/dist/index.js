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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => Appoint
});
module.exports = __toCommonJS(src_exports);
var import_date_fns3 = require("date-fns");
var import_date_fns_tz2 = require("date-fns-tz");
var import_googleapis = require("googleapis");

// src/availability.ts
var import_date_fns = require("date-fns");
var import_date_fns2 = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");
function createAvailability(params) {
  var _a, _b, _c, _d, _e, _f, _g;
  let timeZone = (_a = params == null ? void 0 : params.timeZone) != null ? _a : "America/Los_Angeles";
  let start = (_b = params == null ? void 0 : params.start) != null ? _b : /* @__PURE__ */ new Date();
  let end = (_c = params == null ? void 0 : params.end) != null ? _c : (0, import_date_fns.add)(new Date(start), { days: 7 });
  let duration = (_d = params == null ? void 0 : params.duration) != null ? _d : 30;
  let forceExcludeWeekends = (_e = params == null ? void 0 : params.forceExcludeWeekends) != null ? _e : true;
  let availability = (_f = params == null ? void 0 : params.availability) != null ? _f : {};
  let fallback = (_g = params == null ? void 0 : params.fallback) != null ? _g : [
    {
      start: { hour: 9, minute: 0 },
      end: { hour: 17, minute: 0 }
    }
  ];
  for (let day = forceExcludeWeekends ? 1 : 0; day < (forceExcludeWeekends ? 5 : 6); day++) {
    availability[day] = params && params.availability ? params.availability[day] : fallback;
  }
  const localStart = (0, import_date_fns.startOfHour)(start);
  const localEnd = (0, import_date_fns.endOfHour)(end);
  const intervals = (0, import_date_fns.eachMinuteOfInterval)(
    { start: localStart, end: localEnd },
    {
      step: duration
    }
  ).filter((date) => (0, import_date_fns2.isFuture)(date)).filter((utcDate) => {
    const date = (0, import_date_fns_tz.utcToZonedTime)(utcDate, timeZone);
    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const slots = availability[day];
    if (!slots)
      return false;
    for (const slot of slots) {
      if (hour < slot.start.hour)
        continue;
      if (hour > slot.end.hour)
        continue;
      if (hour === slot.start.hour && minute < slot.start.minute)
        continue;
      if (hour === slot.end.hour && minute > slot.end.minute)
        continue;
      return true;
    }
    return false;
  }).map((date) => ({
    start: date,
    end: (0, import_date_fns.add)(date, { minutes: duration })
  }));
  return intervals;
}

// src/index.ts
function Appoint(params) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f;
    console.log(
      "Appoint timezone: ",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    let start = (_a = params == null ? void 0 : params.start) != null ? _a : /* @__PURE__ */ new Date();
    let end = (_b = params == null ? void 0 : params.end) != null ? _b : (0, import_date_fns3.add)(/* @__PURE__ */ new Date(), { days: 3 });
    let duration = (_c = params == null ? void 0 : params.duration) != null ? _c : 30;
    let padding = (_d = params == null ? void 0 : params.padding) != null ? _d : 0;
    let allSlots = [];
    let busySlots = [];
    let openSlots = [];
    if (!(params == null ? void 0 : params.OAuthClient))
      throw new Error("No oAuthClient provided");
    if (!(params == null ? void 0 : params.OAuthCredentials))
      throw new Error("No authCredentials provided");
    let auth = new import_googleapis.google.auth.OAuth2(params.OAuthClient);
    auth.setCredentials(params.OAuthCredentials);
    let calendar = import_googleapis.google.calendar({ version: "v3", auth });
    let timeZone = (_f = (_e = params == null ? void 0 : params.ownerTimezone) != null ? _e : (yield calendar.settings.get({
      setting: "timezone"
    })).data.value) != null ? _f : "America/Los_Angeles";
    allSlots = createAvailability({
      start,
      end,
      timeZone,
      duration
    });
    busySlots = yield getBusySlotsFromServer();
    const remainingSlots = [...allSlots];
    for (let i = 0; i < allSlots.length; i++) {
      const freeSlot = allSlots[i];
      let isFree = true;
      for (let j = 0; j < busySlots.length; j++) {
        const busySlot = busySlots[j];
        const busyStart = (0, import_date_fns3.sub)(busySlot.start, { minutes: padding });
        const busyEnd = (0, import_date_fns3.add)(busySlot.end, { minutes: padding });
        if ((0, import_date_fns3.areIntervalsOverlapping)(freeSlot, { start: busyStart, end: busyEnd })) {
          isFree = false;
          break;
        }
      }
      if (isFree) {
        openSlots.push(freeSlot);
      }
      const index = remainingSlots.indexOf(freeSlot);
      if (index !== -1) {
        remainingSlots.splice(index, 1);
      }
    }
    console.log(
      `Open slots in ${timeZone}:`,
      openSlots.map(({ start: start2, end: end2 }) => ({
        start: (0, import_date_fns_tz2.utcToZonedTime)(start2, timeZone),
        end: (0, import_date_fns_tz2.utcToZonedTime)(start2, timeZone)
      }))
    );
    return openSlots;
    function getBusySlotsFromServer() {
      return __async(this, null, function* () {
        var _a2, _b2;
        const busyData = yield calendar.freebusy.query({
          requestBody: {
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            timeZone,
            items: [{ id: "primary" }]
          }
        });
        busySlots = Object.values((_b2 = (_a2 = busyData.data) == null ? void 0 : _a2.calendars) != null ? _b2 : {}).flatMap((calendar2) => calendar2.busy).sort((a, b) => {
          var _a3, _b3, _c2, _d2;
          const aStart = new Date((_a3 = a.start) != null ? _a3 : "");
          const bStart = new Date((_b3 = b.start) != null ? _b3 : "");
          const aEnd = new Date((_c2 = a.end) != null ? _c2 : "");
          const bEnd = new Date((_d2 = b.end) != null ? _d2 : "");
          if (aStart < bStart)
            return -1;
          if (aStart > bStart)
            return 1;
          if (aEnd < bEnd)
            return -1;
          if (aEnd > bEnd)
            return 1;
          return 0;
        }).map((busy) => {
          var _a3, _b3;
          return {
            start: new Date((_a3 = busy.start) != null ? _a3 : ""),
            end: new Date((_b3 = busy.end) != null ? _b3 : "")
          };
        });
        return busySlots;
      });
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
