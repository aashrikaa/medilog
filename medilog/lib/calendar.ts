// Calendar utility for AD (Gregorian) to BS (Bikram Sambat) conversion
// Bikram Sambat is the official calendar of Nepal

interface BSDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayName: string;
  fullDate: string;
}

// BS month names in Nepali
const BS_MONTHS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// BS month names in Nepali (Devanagari)
const BS_MONTHS_NEPALI = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
];

// BS day names in Nepali
const BS_DAYS = [
  'Aaitabar', 'Sombar', 'Mangalbar', 'Budhabar', 'Bihibar', 'Sukrabar', 'Sanibar'
];

// BS day names in Nepali (Devanagari)
const BS_DAYS_NEPALI = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
];

// Conversion table for AD to BS (simplified - for exact conversion, use a comprehensive library)
// This is a basic implementation - for production use, consider using 'bikram-sambat' npm package

const AD_TO_BS_OFFSET = 57; // Years difference
const BS_START_DATE = new Date(1918, 3, 13); // April 13, 1918 AD = Baisakh 1, 1975 BS

export function convertToBS(adDate: Date): string {
  try {
    // Calculate days difference from BS start date
    const timeDiff = adDate.getTime() - BS_START_DATE.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Add offset years
    let bsYear = 1975 + Math.floor(daysDiff / 365.25);
    
    // Calculate remaining days for month and day
    let remainingDays = daysDiff % 365;
    
    // Simplified month calculation (this is approximate)
    let bsMonth = Math.floor(remainingDays / 30) + 1;
    let bsDay = remainingDays % 30 + 1;
    
    // Ensure month is within 1-12 range
    if (bsMonth > 12) {
      bsMonth = 12;
      bsDay = 30;
    }
    
    // Ensure day is within 1-30 range
    if (bsDay > 30) bsDay = 30;
    if (bsDay < 1) bsDay = 1;
    
    const monthName = BS_MONTHS[bsMonth - 1];
    const dayName = BS_DAYS[adDate.getDay()];
    
    return `${bsDay} ${monthName} ${bsYear} BS`;
  } catch (error) {
    console.error('Error converting to BS date:', error);
    return 'Date conversion error';
  }
}

export function convertToBSDetailed(adDate: Date): BSDate {
  try {
    const timeDiff = adDate.getTime() - BS_START_DATE.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let bsYear = 1975 + Math.floor(daysDiff / 365.25);
    let remainingDays = daysDiff % 365;
    
    let bsMonth = Math.floor(remainingDays / 30) + 1;
    let bsDay = remainingDays % 30 + 1;
    
    if (bsMonth > 12) {
      bsMonth = 12;
      bsDay = 30;
    }
    
    if (bsDay > 30) bsDay = 30;
    if (bsDay < 1) bsDay = 1;
    
    const monthName = BS_MONTHS[bsMonth - 1];
    const monthNameNepali = BS_MONTHS_NEPALI[bsMonth - 1];
    const dayName = BS_DAYS[adDate.getDay()];
    const dayNameNepali = BS_DAYS_NEPALI[adDate.getDay()];
    
    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay,
      monthName,
      dayName,
      fullDate: `${bsDay} ${monthName} ${bsYear} BS (${dayName})`
    };
  } catch (error) {
    console.error('Error converting to BS date:', error);
    return {
      year: 0,
      month: 0,
      day: 0,
      monthName: 'Error',
      dayName: 'Error',
      fullDate: 'Date conversion error'
    };
  }
}

export function getCurrentBSDate(): string {
  return convertToBS(new Date());
}

export function getCurrentBSDateDetailed(): BSDate {
  return convertToBSDetailed(new Date());
}

// Format AD date for display
export function formatADDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

// Format BS date for display
export function formatBSDate(bsDate: BSDate): string {
  return `${bsDate.day} ${bsDate.monthName} ${bsDate.year} BS`;
}

// Get date range for calendar display
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Check if date is in the past
export function isPast(date: Date): boolean {
  const today = new Date();
  return date < today;
}

// Check if date is in the future
export function isFuture(date: Date): boolean {
  const today = new Date();
  return date > today;
}

// Get days until date
export function getDaysUntil(date: Date): number {
  const today = new Date();
  const timeDiff = date.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Get days since date
export function getDaysSince(date: Date): number {
  const today = new Date();
  const timeDiff = today.getTime() - date.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
