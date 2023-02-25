import Appoint from "appoint"

export default function Page() {
  const appoint = Appoint({
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
      <h1>Page</h1>
    </div>
  )
}
