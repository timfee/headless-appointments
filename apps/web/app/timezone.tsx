"use client"

import { DateInterval } from "appoint"
import { useAvailabilityContext } from "appoint/client"
import { utcToZonedTime } from "date-fns-tz"

export default function Timezone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { state } = useAvailabilityContext()
  const data: DateInterval[] = state.availability

  return (
    <>
      <p suppressHydrationWarning>
        {`The resolved client timezone is ${timeZone}`}
      </p>
      <div>
        {data &&
          data.map(({ start: utcStart, end: utcEnd }) => {
            const start = utcToZonedTime(utcStart, timeZone)
            const end = utcToZonedTime(utcEnd, timeZone)
            return (
              <div key={start.toISOString()}>
                <p suppressHydrationWarning>
                  {start.toLocaleString(undefined)}
                </p>
                <p suppressHydrationWarning>{end.toLocaleString(undefined)}</p>
              </div>
            )
          })}
      </div>
    </>
  )
}
