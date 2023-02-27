import Appoint from "appoint"
import Timezone from "./timezone"

export default async function Page() {
  const appoint = await Appoint({
    OAuthClient: {
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "",
      redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URL ?? "",
    },
    OAuthCredentials: {
      access_token: process.env.GOOGLE_CALENDAR_ACCESS ?? "",
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH ?? "",
    },
  })

  return (
    <div>
      <h1>
        {`The resolved server timezone is ${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }`}
      </h1>
      <Timezone data={appoint} data-superjson />
    </div>
  )
}
