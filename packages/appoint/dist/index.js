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
var import_date_fns = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");
var import_googleapis = require("googleapis");
function Appoint(params) {
  var _a, _b, _c, _d;
  let from = (_a = params.from) != null ? _a : /* @__PURE__ */ new Date();
  let to = (_b = params.to) != null ? _b : (0, import_date_fns.add)(/* @__PURE__ */ new Date(), { days: 6 });
  let duration = (_c = params.duration) != null ? _c : 30;
  let padding = (_d = params.padding) != null ? _d : 0;
  let limits = {
    daysAllowed: [1, 2, 3, 4, 5],
    calendarAllowList: ["primary"],
    fromHour: 9,
    toHour: 17
  };
  let timeZone = "America/Los_Angeles";
  let allSlots = [];
  let busySlots = [];
  if (!params.OAuthClient)
    throw new Error("No oAuthClient provided");
  if (!params.OAuthCredentials)
    throw new Error("No authCredentials provided");
  let auth = new import_googleapis.google.auth.OAuth2(params.OAuthClient);
  auth.setCredentials(params.OAuthCredentials);
  let calendar = import_googleapis.google.calendar({ version: "v3", auth });
  createPotentialSlots();
  createBusySlotsFromServer().then(() => {
    const blah = filterBookedSlots();
    console.log(blah);
  });
  function createPotentialSlots() {
    let endDate = (0, import_date_fns_tz.utcToZonedTime)(
      (0, import_date_fns.set)((0, import_date_fns.add)(from, { hours: 1 }), {
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      }),
      timeZone
    );
    let lastDate = (0, import_date_fns_tz.utcToZonedTime)(
      (0, import_date_fns.set)(to, {
        hours: limits.toHour,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      }),
      timeZone
    );
    while (endDate <= lastDate) {
      const slotStart = endDate;
      const slotEnd = (0, import_date_fns.add)(slotStart, { minutes: duration });
      const slotWeekday = Number.parseInt((0, import_date_fns_tz.formatInTimeZone)(slotStart, timeZone, "c")) - 1;
      if (
        // Event needs to begin on a valid day.
        limits.daysAllowed.includes(slotWeekday) && // Starts after or on workday start.
        slotStart >= (0, import_date_fns.set)(slotStart, { hours: limits.fromHour }) && // Ends before or on workday end
        slotEnd <= (0, import_date_fns.set)(slotStart, { hours: limits.toHour })
      ) {
        allSlots.push({
          start: slotStart,
          end: slotEnd
        });
      }
      endDate = slotEnd;
    }
  }
  function filterBookedSlots() {
    const availableSlots = allSlots.filter((slot) => {
      let conflict = false;
      if (busySlots) {
        busySlots.forEach((event) => {
          var _a2, _b2, _c2, _d2;
          if (event.start && event.end) {
            const eventStart = (0, import_date_fns.add)(new Date((_a2 = event.start) != null ? _a2 : ""), {
              minutes: padding != null ? padding : 0
            }), eventEnd = (0, import_date_fns.sub)(new Date((_b2 = event.end) != null ? _b2 : ""), {
              minutes: padding != null ? padding : 0
            });
            const slotStart = new Date((_c2 = slot.start) != null ? _c2 : ""), slotEnd = new Date((_d2 = slot.end) != null ? _d2 : "");
            if (
              // Slot starts in event
              eventStart < slotStart && slotStart <= eventEnd || // Slot ends in event
              eventStart < slotEnd && slotEnd <= eventEnd || // Event is in slot
              slotStart < eventStart && eventEnd < slotEnd
            )
              conflict = true;
          }
        });
      }
      return !conflict;
    });
    return availableSlots;
  }
  function createBusySlotsFromServer() {
    return __async(this, null, function* () {
      var _a2, _b2;
      const busyData = yield calendar.freebusy.query({
        requestBody: {
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
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
    });
  }
  function getSlots(clientTimezone, busy = true) {
    const slotsResult = [];
    let start = new Date(allSlots[0].start);
    const end = new Date(allSlots[allSlots.length - 1].end);
    let i = 0;
    while (start < end) {
      const slotEnd = new Date(allSlots[i].end);
      if (start < slotEnd) {
        let eventEnd;
        if (i < allSlots.length - 1 && new Date(allSlots[i + 1].start) <= start) {
          i++;
          continue;
        }
        if (i < busySlots.length) {
          const eventStart = new Date(busySlots[i].start);
          eventEnd = new Date(busySlots[i].end);
          if (busy && eventStart < slotEnd) {
            slotsResult.push({
              start: eventStart,
              end: eventEnd
            });
          }
          start = eventEnd;
          i++;
        } else if (!busy) {
          slotsResult.push({
            start,
            end: slotEnd
          });
        }
        start = slotEnd;
      }
      i++;
    }
    const formattedSlots = slotsResult.reduce((acc, curr) => {
      const date = curr.start.toISOString().substring(0, 10);
      if (!acc[date]) {
        acc[date] = { date, events: [] };
      }
      acc[date].events.push(curr);
      return acc;
    }, {});
    console.log(Object.values(formattedSlots));
    console.log(
      slotsResult.map((slot) => {
        return (0, import_date_fns_tz.formatInTimeZone)(slot.start, timeZone, "hh:mm") + " - " + (0, import_date_fns_tz.formatInTimeZone)(slot.end, timeZone, "hh:mm");
      })
    );
    return slotsResult;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
