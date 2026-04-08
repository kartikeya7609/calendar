import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  addDays
} from 'date-fns';

export const getMonthDetails = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  return { monthStart, monthEnd, startDate, endDate };
};

export const getDaysInView = (date) => {
  const { monthStart, startDate, endDate } = getMonthDetails(date);
  const days = [];
  let day = startDate;
  const now = new Date();

  while (day <= endDate) {
    days.push({
      dateObj: day,
      timestamp: day.getTime(),
      dayNum: format(day, 'd'),
      isToday: isSameDay(day, now),
      isCurrentMonth: isSameMonth(day, monthStart)
    });
    day = addDays(day, 1);
  }
  return days;
};

export const holidays = {
  '0-1': '🎉',
  '1-14': '💕',
  '2-17': '☘️',
  '3-1': '✨',
  '4-4': '🌌',
  '5-20': '☀️',
  '6-4': '🎆',
  '9-31': '🎃',
  '11-25': '🎄',
  '11-31': '🥂'
};
