import { describe, expect, it } from "vitest";
import { averageFundRecoveryDays } from "./fundRecovery";

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

describe("averageFundRecoveryDays", () => {
  it("returns null when nothing has been recovered", () => {
    expect(
      averageFundRecoveryDays([
        { date: d("2026-08-01"), amount: 1000, countsForRecovery: true },
      ]),
    ).toBeNull();
  });

  it("measures days from supply to FIFO receipt", () => {
    // 600 of the Jul 1 sale recovered after 40 days; rest unpaid
    expect(
      averageFundRecoveryDays([
        { date: d("2026-07-01"), amount: 1000, countsForRecovery: true },
        { date: d("2026-08-01"), amount: 400, countsForRecovery: true },
        { date: d("2026-08-10"), amount: -600 },
      ]),
    ).toBe(40);
  });

  it("treats same-day / advance recovery as 0 days", () => {
    expect(
      averageFundRecoveryDays([
        { date: d("2026-08-10"), amount: -500 },
        { date: d("2026-08-10"), amount: 500, countsForRecovery: true },
      ]),
    ).toBe(0);

    expect(
      averageFundRecoveryDays([
        { date: d("2026-08-01"), amount: -1000 },
        { date: d("2026-08-12"), amount: 1000, countsForRecovery: true },
      ]),
    ).toBe(0);
  });

  it("weights partial recoveries by amount", () => {
    // 100 recovered in 10 days + 300 recovered in 30 days → (1000+9000)/400 = 25
    expect(
      averageFundRecoveryDays([
        { date: d("2026-07-01"), amount: 100, countsForRecovery: true },
        { date: d("2026-07-01"), amount: 300, countsForRecovery: true },
        { date: d("2026-07-11"), amount: -100 },
        { date: d("2026-07-31"), amount: -300 },
      ]),
    ).toBe(25);
  });

  it("ignores recoveries of non-supply charges in the average", () => {
    // Discount received (charge) cleared first; sale recovered later
    expect(
      averageFundRecoveryDays([
        { date: d("2026-07-01"), amount: 200, countsForRecovery: false },
        { date: d("2026-07-10"), amount: 800, countsForRecovery: true },
        { date: d("2026-07-15"), amount: -200 },
        { date: d("2026-08-09"), amount: -800 },
      ]),
    ).toBe(30);
  });

  it("limits the average to charges inside the date window", () => {
    expect(
      averageFundRecoveryDays(
        [
          { date: d("2026-06-01"), amount: 500, countsForRecovery: true },
          { date: d("2026-08-01"), amount: 500, countsForRecovery: true },
          { date: d("2026-06-11"), amount: -500 },
          { date: d("2026-08-21"), amount: -500 },
        ],
        {
          chargeDateFrom: d("2026-08-01"),
          chargeDateTo: d("2026-08-31"),
        },
      ),
    ).toBe(20);
  });
});
