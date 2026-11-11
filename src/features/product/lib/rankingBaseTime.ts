const HOUR_MS = 60 * 60 * 1000;

const baseTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  month: "2-digit",
  timeZone: "Asia/Seoul",
});

// The backend re-ranks every hour on the hour (UTC, which is also on the hour in KST) but does not
// say when it last did, so the label shows the latest whole hour. Right after the hour, or after a
// failed re-rank, the ranking on screen can be older than the label.
export function getRankingBaseTime(now = Date.now()) {
  const baseTime = new Date(Math.floor(now / HOUR_MS) * HOUR_MS);
  const parts = Object.fromEntries(
    baseTimeFormatter.formatToParts(baseTime).map((part) => [part.type, part.value]),
  );

  return {
    dateTime: baseTime.toISOString(),
    label: `${parts.month}.${parts.day} ${parts.hour}:00`,
  };
}
