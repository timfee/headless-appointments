import { utcToZonedTime } from "date-fns-tz"
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react"

import {
  DateAsStringInterval,
  DateInterval,
  mapStringsToDates,
} from "../shared"

export type State = {
  timeZone: string
  date: Date
  dialog: boolean
  duration: number
  availability: DateInterval[]
}

type Action =
  | {
      type: "set_date"
      payload: Date
    }
  | {
      type: "set_timezone"
      payload: string
    }
  | { type: "set_dialog"; payload: boolean }
  | { type: "set_duration"; payload: number }

const INITIAL_STATE: State = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  date: new Date(),
  availability: [],
  dialog: false,
  duration: 30,
}

const AvailabilityContext = createContext<{
  state: State
  dispatch: Dispatch<Action>
}>({
  dispatch: () => null,
  state: INITIAL_STATE,
})

export function AvailabilityProvider({
  children,
  data,
}: PropsWithChildren<{
  data: DateAsStringInterval[]
}>) {
  const dataAsDates = mapStringsToDates(data)
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    availability: dataAsDates,
  })

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "set_date":
        return {
          ...state,
          date: action.payload,
        }

      case "set_timezone":
        return {
          ...state,
          timeZone: action.payload,
        }

      case "set_dialog": {
        return {
          ...state,
          dialog: action.payload,
        }
      }

      case "set_duration": {
        return {
          ...state,
          duration: action.payload,
        }
      }

      default:
        return state
    }
  }

  return (
    <AvailabilityContext.Provider value={{ dispatch, state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export function useAvailabilityContext() {
  if (!useContext(AvailabilityContext))
    throw new Error(
      "AvailabilityContext is not defined. Did you forget to wrap your component in AvailabilityProvider?"
    )
  return useContext(AvailabilityContext)
}

function groupAvailabilityByDay(
  availability: DateInterval[],
  timeZone: string
) {
  const returnValue = availability.reduce((acc, cur) => {
    const date = utcToZonedTime(cur.start, timeZone)
    const key = date.toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(cur)
    return acc
  }, {} as Record<string, typeof availability>)

  return returnValue
}
