import { add, areIntervalsOverlapping, sub } from "date-fns"

import { DateInterval } from "../shared"

/** Options for {@link returnAvailableSlots} */
export type ReturnAvailableSlotsProps = {
  /**
   * An array of intervalus we _could_ offer, provided
   * there's no conflicting busy periods.
   */
  allSlots: DateInterval[]
  /**
   * An array of busy intervals to exclude from the
   * final result.
   */
  busySlots: DateInterval[]
  /**
   * The number of minutes to "pad" each interval, e.g.
   * start and end `padding` minutes earlier and later,
   * respectively.
   *
   * Use 0 to disable padding.
   */
  padding: number
}

export function returnAvailableSlots({
  allSlots,
  busySlots,
  padding,
}: ReturnAvailableSlotsProps) {
  // Our final array of available slots
  const openSlots: DateInterval[] = []

  // Make a deep copy of the allSlots array
  const remainingSlots = [...allSlots]

  for (let i = 0; i < allSlots.length; i++) {
    const freeSlot = allSlots[i]

    // Check if the free slot overlaps with any busy slot
    let isFree = true
    for (let j = 0; j < busySlots.length; j++) {
      const busySlot = busySlots[j]
      const busyStart = sub(busySlot.start, { minutes: padding })
      const busyEnd = add(busySlot.end, { minutes: padding })
      if (
        areIntervalsOverlapping(freeSlot, { start: busyStart, end: busyEnd })
      ) {
        isFree = false
        break
      }
    }

    // If the free slot is not booked, add it to the result
    if (isFree) {
      openSlots.push(freeSlot)
    }

    // Remove the free slot from the remainingSlots array
    const index = remainingSlots.indexOf(freeSlot)
    if (index !== -1) {
      remainingSlots.splice(index, 1)
    }
  }

  return openSlots
}
