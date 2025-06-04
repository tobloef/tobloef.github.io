const DATE_TIME_FORMAT = new Intl.DateTimeFormat(
  "US-en",
  {
    dateStyle: "full",
    timeZone: "Europe/Copenhagen",
  }
);

const ORDINAL_PLURAL_RULES = new Intl.PluralRules(
  "en",
  {
    type: "ordinal"
  }
);

const ORDINAL_SUFFIXES = {
  "zero": "",
  "many": "",
  "one": "st",
  "two": "nd",
  "few": "rd",
  "other": "th"
};

export function formatDate(
  date: Date | string,
  options?: { includeDay?: boolean }
): string {
  let { includeDay = false } = options ?? {};

  if (typeof date === "string") {
    date = new Date(date);
  }

  const parts = DATE_TIME_FORMAT.formatToParts(date);

  const rawDay = parts.find((part) => part.type === "day")!.value;
  const month = parts.find((part) => part.type === "month")!.value;
  const year = parts.find((part) => part.type === "year")!.value;

  const ordinal = ORDINAL_PLURAL_RULES.select(Number(rawDay));
  const ordinalSuffix = ORDINAL_SUFFIXES[ordinal];

  const day = `${rawDay}${ordinalSuffix}`;

  return `${month} ${includeDay ? `${day} ` : ""}${year}`;
}

