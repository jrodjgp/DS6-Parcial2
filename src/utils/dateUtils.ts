export function isValidDateText(value: string): boolean {
  const cleanValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    return false;
  }

  const [yearText, monthText, dayText] = cleanValue.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsedDate = new Date(`${cleanValue}T00:00:00`);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() + 1 === month &&
    parsedDate.getDate() === day
  );
}

export function isFutureDateText(value: string, referenceDate = new Date()): boolean {
  if (!isValidDateText(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  return date.getTime() > today.getTime();
}

export function isTodayText(value: string, referenceDate = new Date()): boolean {
  if (!isValidDateText(value)) {
    return false;
  }

  const today = referenceDate.toISOString().split('T')[0];
  return value === today;
}
