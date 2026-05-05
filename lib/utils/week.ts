import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

/** Monday 00:00 of the ISO week containing `d` (local time). */
export function mondayOf(d: Dayjs | Date | string): Dayjs {
    return dayjs(d).startOf("isoWeek");
}

/** `YYYY-MM-DD` formatted date. */
export function toISODate(d: Dayjs): string {
    return d.format("YYYY-MM-DD");
}

/** True when `a` and `b` fall in the same ISO week. */
export function isSameWeek(a: Dayjs, b: Dayjs): boolean {
    return mondayOf(a).isSame(mondayOf(b), "day");
}

/**
 * Human-readable Mon–Sun range, e.g. "Apr 13–19" or "Dec 30–Jan 5" when it
 * straddles two months. Uses dayjs default locale months.
 */
export function formatWeekRange(monday: Dayjs): string {
    const sunday = monday.add(6, "day");
    if (monday.month() === sunday.month()) {
        return `${monday.format("MMM D")}–${sunday.format("D")}`;
    }
    return `${monday.format("MMM D")}–${sunday.format("MMM D")}`;
}
