import { type Auth, google } from "googleapis"

import { DateInterval } from "../shared"

export type GetFreeBusyProps = {
  start: Date
  end: Date
} & FreeBusyProviders

type FreeBusyProviders = {
  provider: {
    name: "google"
    OAuthClient: Auth.OAuth2ClientOptions
    OAuthCredentials: Auth.Credentials
  }
}

export async function getFreeBusyData(params: GetFreeBusyProps) {
  if (!params.start) throw new Error("getFreeBusyData: No start date provided")
  if (!params.end) throw new Error("getFreeBusyData: No end date provided")

  if (!params?.provider)
    throw new Error("getFreeBusyData: No `provider` object passed")
  if (!params?.provider.OAuthClient)
    throw new Error("getFreeBusyData: `provider` doesn't contain OAuthClient")
  if (!params?.provider.OAuthCredentials)
    throw new Error(
      "getFreeBusyData: `provider` doesn't include AuthCredentials"
    )

  const start = params?.start
  const end = params?.end

  let auth: Auth.OAuth2Client = new google.auth.OAuth2(
    params.provider.OAuthClient
  )
  auth.setCredentials(params.provider.OAuthCredentials)

  let calendar = google.calendar({ version: "v3", auth: auth })

  // get the configured timezone, so we can use it as a default
  // value in the main function, if we need to.
  let timeZone =
    (
      await calendar.settings.get({
        setting: "timezone",
      })
    ).data.value ?? "UTC"

  // get busyData in UTC time,
  // see https://developers.google.com/calendar/v3/reference/freebusy/query
  const busyData = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: "primary" }],
    },
  })

  const busySlots: DateInterval[] = Object.values(
    busyData.data?.calendars ?? {}
  )
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

  return { timeZone, busySlots }
}
