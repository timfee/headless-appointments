import { utcToZonedTime } from "date-fns-tz"

import { createAvailability, CreateAvailabilityProps } from "./availability"
import { getFreeBusyData, GetFreeBusyProps } from "./busy"
import { returnAvailableSlots } from "./offers"
import { DeepMergeTwoTypes } from "./utils"

type AppointParams = GetFreeBusyProps &
  DeepMergeTwoTypes<
    CreateAvailabilityProps,
    {
      bookingCriteria: {
        padding: number
      }
    }
  >

export default async function Appoint(params?: AppointParams) {
  console.log(
    "Appoint timezone: ",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  if (!params?.start) throw new Error("No `start` date passed")
  if (!params?.end) throw new Error("No `end` date passed")
  if (!params.bookingCriteria.duration) throw new Error("No `duration` passed")

  let padding = params?.bookingCriteria.padding ?? 0

  if (!params?.provider) throw new Error("No `provider` object passed")
  if (!params?.provider.OAuthClient)
    throw new Error("`provider` doesn't contain OAuthClient")
  if (!params?.provider.OAuthCredentials)
    throw new Error("`provider` doesn't include AuthCredentials")

  const { busySlots, timeZone } = await getFreeBusyData({
    start: params.start,
    end: params.end,
    provider: {
      name: "google",
      OAuthClient: params.provider.OAuthClient,
      OAuthCredentials: params.provider.OAuthCredentials,
    },
  })

  const timeZoneOfStartAndEndTimes =
    params?.timeZoneOfStartAndEndTimes ?? timeZone

  const allSlots = createAvailability({
    start: params.start,
    end: params.end,
    timeZoneOfStartAndEndTimes,
    bookingCriteria: {
      duration: params.bookingCriteria.duration,
    },
  })

  const openSlots = returnAvailableSlots({
    allSlots,
    busySlots,
    padding,
  })

  console.log(
    `Open slots in ${timeZone}:`,
    openSlots.map(({ start, end }) => ({
      start: utcToZonedTime(start, timeZone),
      end: utcToZonedTime(start, timeZone),
    }))
  )

  return openSlots
}
