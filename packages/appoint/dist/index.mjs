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
import { utcToZonedTime as utcToZonedTime2 } from "date-fns-tz";

// src/availability.ts
import { add, eachMinuteOfInterval, endOfHour, startOfHour } from "date-fns";
import { isFuture } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
function createAvailability({
  start,
  end,
  timeZoneOfStartAndEndTimes,
  bookingCriteria = {
    duration: 30
  },
  availability = {
    dailySlots: {},
    fallback: [
      {
        start: { hour: 9, minute: 0 },
        end: { hour: 17, minute: 0 }
      }
    ],
    forceExcludeWeekends: false
  }
}) {
  var _a, _b;
  if (!start)
    throw new Error("Missing start date");
  if (!end)
    throw new Error("Missing end date");
  if (!bookingCriteria.duration)
    throw new Error("Missing duration");
  if (!timeZoneOfStartAndEndTimes)
    throw new Error("Missing timeZone");
  const dailyAvailability = {};
  for (let day = availability.forceExcludeWeekends ? 1 : 0; day < (availability.forceExcludeWeekends ? 5 : 6); day++) {
    dailyAvailability[day] = (_b = (_a = dailyAvailability[day]) != null ? _a : availability.fallback) != null ? _b : [];
  }
  const intervals = eachMinuteOfInterval(
    { start: startOfHour(start), end: endOfHour(end) },
    {
      step: bookingCriteria.duration
    }
  ).filter((date) => isFuture(date)).filter((utcDate) => {
    const date = utcToZonedTime(utcDate, timeZoneOfStartAndEndTimes), day = date.getDay(), hour = date.getHours(), minute = date.getMinutes(), slots = dailyAvailability[day];
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
    end: add(date, { minutes: bookingCriteria.duration })
  }));
  return intervals;
}

// src/busy.ts
import { google } from "googleapis";
function getFreeBusyData(params) {
  return __async(this, null, function* () {
    var _a, _b, _c;
    if (!params.start)
      throw new Error("getFreeBusyData: No start date provided");
    if (!params.end)
      throw new Error("getFreeBusyData: No end date provided");
    if (!(params == null ? void 0 : params.provider))
      throw new Error("getFreeBusyData: No `provider` object passed");
    if (!(params == null ? void 0 : params.provider.OAuthClient))
      throw new Error("getFreeBusyData: `provider` doesn't contain OAuthClient");
    if (!(params == null ? void 0 : params.provider.OAuthCredentials))
      throw new Error(
        "getFreeBusyData: `provider` doesn't include AuthCredentials"
      );
    const start = params == null ? void 0 : params.start;
    const end = params == null ? void 0 : params.end;
    let auth = new google.auth.OAuth2(
      params.provider.OAuthClient
    );
    auth.setCredentials(params.provider.OAuthCredentials);
    let calendar = google.calendar({ version: "v3", auth });
    let timeZone = (_a = (yield calendar.settings.get({
      setting: "timezone"
    })).data.value) != null ? _a : "UTC";
    const busyData = yield calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: "primary" }]
      }
    });
    const busySlots = Object.values((_c = (_b = busyData.data) == null ? void 0 : _b.calendars) != null ? _c : {}).flatMap((calendar2) => calendar2.busy).sort((a, b) => {
      var _a2, _b2, _c2, _d;
      const aStart = new Date((_a2 = a.start) != null ? _a2 : "");
      const bStart = new Date((_b2 = b.start) != null ? _b2 : "");
      const aEnd = new Date((_c2 = a.end) != null ? _c2 : "");
      const bEnd = new Date((_d = b.end) != null ? _d : "");
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
      var _a2, _b2;
      return {
        start: new Date((_a2 = busy.start) != null ? _a2 : ""),
        end: new Date((_b2 = busy.end) != null ? _b2 : "")
      };
    });
    return { timeZone, busySlots };
  });
}

// src/offers.ts
import { add as add2, areIntervalsOverlapping, sub } from "date-fns";
function returnAvailableSlots({
  allSlots,
  busySlots,
  padding
}) {
  const openSlots = [];
  const remainingSlots = [...allSlots];
  for (let i = 0; i < allSlots.length; i++) {
    const freeSlot = allSlots[i];
    let isFree = true;
    for (let j = 0; j < busySlots.length; j++) {
      const busySlot = busySlots[j];
      const busyStart = sub(busySlot.start, { minutes: padding });
      const busyEnd = add2(busySlot.end, { minutes: padding });
      if (areIntervalsOverlapping(freeSlot, { start: busyStart, end: busyEnd })) {
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
  return openSlots;
}

// src/index.ts
function getAvailability(params) {
  return __async(this, null, function* () {
    var _a, _b;
    console.log(
      "Appoint timezone: ",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    if (!(params == null ? void 0 : params.start))
      throw new Error("No `start` date passed");
    if (!(params == null ? void 0 : params.end))
      throw new Error("No `end` date passed");
    if (!params.bookingCriteria.duration)
      throw new Error("No `duration` passed");
    let padding = (_a = params == null ? void 0 : params.bookingCriteria.padding) != null ? _a : 0;
    if (!(params == null ? void 0 : params.provider))
      throw new Error("No `provider` object passed");
    if (!(params == null ? void 0 : params.provider.OAuthClient))
      throw new Error("`provider` doesn't contain OAuthClient");
    if (!(params == null ? void 0 : params.provider.OAuthCredentials))
      throw new Error("`provider` doesn't include AuthCredentials");
    const { busySlots, timeZone } = yield getFreeBusyData({
      start: params.start,
      end: params.end,
      provider: {
        name: "google",
        OAuthClient: params.provider.OAuthClient,
        OAuthCredentials: params.provider.OAuthCredentials
      }
    });
    const timeZoneOfStartAndEndTimes = (_b = params == null ? void 0 : params.timeZoneOfStartAndEndTimes) != null ? _b : timeZone;
    const allSlots = createAvailability({
      start: params.start,
      end: params.end,
      timeZoneOfStartAndEndTimes,
      bookingCriteria: {
        duration: params.bookingCriteria.duration
      }
    });
    const openSlots = returnAvailableSlots({
      allSlots,
      busySlots,
      padding
    });
    console.log(
      `Open slots in ${timeZone}:`,
      openSlots.map(({ start, end }) => ({
        start: utcToZonedTime2(start, timeZone),
        end: utcToZonedTime2(start, timeZone)
      }))
    );
    return openSlots;
  });
}
export {
  getAvailability as default
};
