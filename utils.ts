import { DataPoint } from './types';

export const parseCSV = (csvText: string): DataPoint[] => {
  const lines = csvText.trim().split('\n');
  const data: DataPoint[] = [];

  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Regex to handle "Date","Value" format
    // Matches "01/01/1915",0.51
    const match = line.match(/"([^"]+)",([0-9.]+)/);
    
    if (match) {
      const dateStr = match[1]; // DD/MM/YYYY
      const valueStr = match[2];

      // Convert DD/MM/YYYY to YYYY-MM-DD for correct sorting and chart usage
      const [day, month, year] = dateStr.split('/');
      const isoDate = `${year}-${month}-${day}`;

      data.push({
        date: isoDate,
        displayDate: dateStr,
        value: parseFloat(valueStr),
      });
    }
  }

  // Ensure sorted by date
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};