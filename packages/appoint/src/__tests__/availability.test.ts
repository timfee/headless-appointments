import { startOfDay, endOfDay } from "date-fns"

describe("Availability without parameters", () => {
  it("should return 9-5 by default", () => {
    const availability = {
      start: startOfDay(new Date("2023-02-27")),
      end: endOfDay(new Date("2023-02-28")),
    }
  })
})
