const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const teens = [
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 
  'أربعة عشر', 'خمسة عشر', 'ستة عشر', 
  'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
];

function convertLessThanOneThousand(number: number): string {
  if (number === 0) {
    return '';
  }

  let words = '';

  if (number >= 100) {
    const hundreds = Math.floor(number / 100);
    words += (hundreds === 1 ? 'مائة' : ones[hundreds] + ' مائة') + ' ';
    number %= 100;
  }

  if (number >= 20) {
    const tensIndex = Math.floor(number / 10);
    words += tens[tensIndex] + ' ';
    number %= 10;
  } else if (number >= 10) {
    words += teens[number - 10] + ' ';
    return words.trim();
  }

  if (number > 0) {
    words += ones[number] + ' ';
  }

  return words.trim();
}

export function convertToWords(number: number): string {
  if (number === 0) {
    return 'صفر';
  }

  const billion = Math.floor(number / 1000000000);
  const million = Math.floor((number % 1000000000) / 1000000);
  const thousand = Math.floor((number % 1000000) / 1000);
  const remainder = Math.floor(number % 1000);

  let words = '';

  if (billion > 0) {
    words += convertLessThanOneThousand(billion) + ' مليار ';
  }

  if (million > 0) {
    words += convertLessThanOneThousand(million) + ' مليون ';
  }

  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + ' ألف ';
  }

  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder);
  }

  return words.trim();
}
