"use client"
import { utcToZonedTime } from "date-fns-tz"

export default function Timezone({
  data,
}: {
  data: { start: Date; end: Date }[]
}) {
  const timeZone = "America/New_York" // Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <>
      <p suppressHydrationWarning>
        {`The resolved client timezone is ${timeZone}`}
      </p>
      <div>
        {data.map(({ start: utcStart, end: utcEnd }) => {
          const start = utcToZonedTime(utcStart, timeZone)
          const end = utcToZonedTime(utcEnd, timeZone)
          return (
            <div key={start.toISOString()}>
              <pre suppressHydrationWarning>
                {start.toISOString()} {start.getTimezoneOffset()}
                <br />
                {}
              </pre>
              <p suppressHydrationWarning>{start.toLocaleString(undefined)}</p>
              <p suppressHydrationWarning>{end.toLocaleString(undefined)}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}
