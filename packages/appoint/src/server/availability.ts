import "server-only"

import { add, eachMinuteOfInterval, endOfHour, startOfHour } from "date-fns"
import { isFuture } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"

import { DateInterval } from "../shared"

export type AvailabilitySlot = {
  start: { hour: number; minute: number }
  end: { hour: number; minute: number }
}

export type AvailabilityType = {
  [key: number]: AvailabilitySlot[]
}

/** Options for {@link createAvailability} */
export type CreateAvailabilityProps = {
  /**
   * The start date to begin looking for availability.
   *
   * Dates in the past are automatically excluded.
   */
  start: Date
  /**
   * The end date to stop looking for availability.
   */
  end: Date

  /**
   * A {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones tz database name}
   * for the timezone of the start and end dates.
   *
   * @example "America/Los_Angeles"
   */
  timeZoneOfStartAndEndTimes: string
  /**
   * Boking criteria is relevant to computing availability.
   * In this case, we're just looking at `duration`.
   */
  bookingCriteria: {
    duration: number
  }
  /**
   * Options that determine what availability we offer
   */
  availability?: {
    /**
     * A map of days of the week to availability slots.
     * The keys are numbers from 0-6, where 0 is Sunday and 6 is Saturday.
     *
     * The values are arrays of {@link AvailabilitySlot}
     *
     * If there's no availability provided for a given
     * day of the week, {@link fallback} will be used.
     *
     * @example { 1: [ { start: { hour: 9, minute: 0 },
     *    end: { hour: 12, minute: 0 },
     *  }, { start: { hour: 14, minute: 30 },
     *    end: { hour: 17, minute: 0 } }
     * ]
     */
    dailySlots: AvailabilityType
    /**
     * A list of availability slots to use for any day of the week
     * that doesn't have a value in {@link dailySlots}.
     *
     * @defaultValue 09:00 - 17:00 (5 PM)
     */
    fallback?: AvailabilitySlot[]
    /**
     * If true, availability will not be offered on weekends,
     * even if {@link dailySlots} or {@link fallback} are provided.
     */
    forceExcludeWeekends?: boolean
  }
}

export function createAvailability({
  start,
  end,
  timeZoneOfStartAndEndTimes,
  bookingCriteria = {
    duration: 30,
  },
  availability = {
    dailySlots: {},
    fallback: [
      {
        start: { hour: 9, minute: 0 },
        end: { hour: 17, minute: 0 },
      },
    ],
    forceExcludeWeekends: false,
  },
}: CreateAvailabilityProps): DateInterval[] {
  // Required fields
  if (!start) throw new Error("Missing start date")
  if (!end) throw new Error("Missing end date")
  if (!bookingCriteria.duration) throw new Error("Missing duration")
  if (!timeZoneOfStartAndEndTimes) throw new Error("Missing timeZone")

  // Use to keep track of all potential availability slots
  const dailyAvailability: AvailabilityType = {}

  // Use the fallback for any missing key, excluding weekends if desired
  for (
    let day = availability.forceExcludeWeekends
      ? 1 /* Monday */
      : 0 /* Sunday */;
    day <
    (availability.forceExcludeWeekends ? 5 /* Friday */ : 6) /* Saturday */;
    day++
  ) {
    dailyAvailability[day] =
      dailyAvailability[day] ?? availability.fallback ?? []
  }

  const intervals: DateInterval[] = eachMinuteOfInterval(
    { start: startOfHour(start), end: endOfHour(end) },
    {
      step: bookingCriteria.duration,
    }
  )
    // Filter out any slots that are in the past
    .filter((date) => isFuture(date))
    // Filter out any slots that are not in our availability
    .filter((utcDate) => {
      // Look at the day through the lens of the calendar owner's timezone.
      const date = utcToZonedTime(utcDate, timeZoneOfStartAndEndTimes),
        day = date.getDay(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        slots = dailyAvailability[day]

      // Bail if there's no availability for this day.
      if (!slots) return false

      for (const slot of slots) {
        // Bail if the hour starts before the slot's hour does.
        if (hour < slot.start.hour) continue

        // Bail if the hour ends after the slot's end does.
        if (hour > slot.end.hour) continue

        // Apply the same before and after logic for minutes
        // when the hour is the same.
        if (hour === slot.start.hour && minute < slot.start.minute) continue
        if (hour === slot.end.hour && minute > slot.end.minute) continue

        return true
      }
      return false
    })
    .map((date) => ({
      start: date,
      end: add(date, { minutes: bookingCriteria.duration }),
    }))

  return intervals
}
