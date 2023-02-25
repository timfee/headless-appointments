import { add, set, sub } from "date-fns"
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz"
import { google } from "googleapis"
import { type Auth } from "googleapis"

type Event = {
  start: Date
  end: Date
}

type AppointParams = {
  from?: Date
  to?: Date
  duration?: number
  padding?: number
  limits?: {
    daysAllowed: number[]
    calendarAllowList: string[]
    fromHour: number
    toHour: number
  }
  timeZone?: string
  OAuthClient: Auth.OAuth2ClientOptions
  OAuthCredentials: Auth.Credentials
}

export default function Appoint(params: AppointParams) {
  let from = params.from ?? new Date()
  let to = params.to ?? add(new Date(), { days: 6 })

  let duration = params.duration ?? 30
  let padding = params.padding ?? 0
  let limits = {
    daysAllowed: [1, 2, 3, 4, 5],
    calendarAllowList: ["primary"],
    fromHour: 9,
    toHour: 17,
  }

  let timeZone = "America/Los_Angeles"
  let allSlots: Event[] = []
  let busySlots: Event[] = []

  if (!params.OAuthClient) throw new Error("No oAuthClient provided")
  if (!params.OAuthCredentials) throw new Error("No authCredentials provided")

  let auth: Auth.OAuth2Client = new google.auth.OAuth2(params.OAuthClient)
  auth.setCredentials(params.OAuthCredentials)

  let calendar = google.calendar({ version: "v3", auth: auth })

  createPotentialSlots()
  createBusySlotsFromServer().then(() => {
    const blah = filterBookedSlots()
    console.log(blah)
  })

  function createPotentialSlots() {
    // Start with endDate at the beginning of our availability
    // which is the top of the next hour.
    let endDate = utcToZonedTime(
      set(add(from, { hours: 1 }), {
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
      timeZone
    )

    // Iterate through the end of the business day (in local time)
    // on the last day of availability .

    let lastDate = utcToZonedTime(
      set(to, {
        hours: limits.toHour,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
      timeZone
    )

    while (endDate <= lastDate) {
      const slotStart = endDate
      const slotEnd = add(slotStart, { minutes: duration })

      // const slotLocalDate = new Date(
      //   Number.parseInt(formatInTimeZone(slotStart, timeZone, "yyyy")),
      //   Number.parseInt(formatInTimeZone(slotStart, timeZone, "MM")) - 1,
      //   Number.parseInt(formatInTimeZone(slotStart, timeZone, "dd"))
      // )

      const slotWeekday =
        Number.parseInt(formatInTimeZone(slotStart, timeZone, "c")) - 1

      if (
        // Event needs to begin on a valid day.
        limits.daysAllowed.includes(slotWeekday) &&
        // Starts after or on workday start.
        slotStart >= set(slotStart, { hours: limits.fromHour }) &&
        // Ends before or on workday end
        slotEnd <= set(slotStart, { hours: limits.toHour })
      ) {
        allSlots.push({
          start: slotStart,
          end: slotEnd,
        })
      }

      endDate = slotEnd
    }
  }

  function filterBookedSlots() {
    const availableSlots = allSlots.filter((slot) => {
      let conflict = false

      if (busySlots) {
        busySlots.forEach((event) => {
          if (event.start && event.end) {
            const eventStart = add(new Date(event.start ?? ""), {
                minutes: padding ?? 0,
              }),
              eventEnd = sub(new Date(event.end ?? ""), {
                minutes: padding ?? 0,
              })

            const slotStart = new Date(slot.start ?? ""),
              slotEnd = new Date(slot.end ?? "")

            if (
              // Slot starts in event
              (eventStart < slotStart && slotStart <= eventEnd) ||
              // Slot ends in event
              (eventStart < slotEnd && slotEnd <= eventEnd) ||
              // Event is in slot
              (slotStart < eventStart && eventEnd < slotEnd)
            )
              conflict = true
          }
        })
      }
      return !conflict
    })

    return availableSlots
  }

  async function createBusySlotsFromServer() {
    const busyData = await calendar.freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        timeZone: timeZone,
        items: [{ id: "primary" }],
      },
    })

    busySlots = Object.values(busyData.data?.calendars ?? {})
      .flatMap((calendar) => calendar.busy!)
      .sort((a, b) => {
        const aStart = new Date(a.start ?? "")
        const bStart = new Date(b.start ?? "")
        const aEnd = new Date(a.end ?? "")
        const bEnd = new Date(b.end ?? "")

        if (aStart < bStart) return -1
        if (aStart > bStart) return 1
        if (aEnd < bEnd) return -1
        if (aEnd > bEnd) return 1
        return 0
      })
      .map((busy) => ({
        start: new Date(busy.start ?? ""),
        end: new Date(busy.end ?? ""),
      }))
  }

  function getSlots(clientTimezone: string, busy = true) {
    const slotsResult: Event[] = []

    let start = new Date(allSlots[0].start)
    const end = new Date(allSlots[allSlots.length - 1].end)

    let i = 0

    while (start < end) {
      const slotEnd = new Date(allSlots[i].end)

      if (start < slotEnd) {
        let eventEnd

        if (
          i < allSlots.length - 1 &&
          new Date(allSlots[i + 1].start) <= start
        ) {
          i++
          continue
        }

        if (i < busySlots.length) {
          const eventStart = new Date(busySlots[i].start)
          eventEnd = new Date(busySlots[i].end)

          if (busy && eventStart < slotEnd) {
            slotsResult.push({
              start: eventStart,
              end: eventEnd,
            })
          }
          start = eventEnd
          i++
        } else if (!busy) {
          slotsResult.push({
            start: start,
            end: slotEnd,
          })
        }
        start = slotEnd
      }
      i++
    }

    const formattedSlots = slotsResult.reduce((acc, curr) => {
      const date = curr.start.toISOString().substring(0, 10)
      if (!acc[date]) {
        acc[date] = { date, events: [] }
      }
      acc[date].events.push(curr)
      return acc
    }, {} as { [keyof: string]: { date: string; events: Event[] } })

    console.log(Object.values(formattedSlots))

    console.log(
      slotsResult.map((slot) => {
        return (
          formatInTimeZone(slot.start, timeZone, "hh:mm") +
          " - " +
          formatInTimeZone(slot.end, timeZone, "hh:mm")
        )
      })
    )

    return slotsResult
  }
}
