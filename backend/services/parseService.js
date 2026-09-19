const normalizeCurrencyNumber = (value) => {
  if (!value) return null;
  const clean = String(value)
    .replace(/[^\d,\.]/g, '')
    .trim();

  if (!clean || clean === '.') return null;

  const normalized = clean.replace(/,/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const extractAmountCandidates = (rawText) => {
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const candidates = [];

  const totalLabels = [
    'grand total', 'total amount', 'net amount', 'amount due', 'net payable',
    'payable', 'bill amount', 'invoice total', 'total', 'grand', 'amount', 'net total'
  ];

  const ignoreLabels = [
    'cash', 'paid', 'payment', 'received', 'balance', 'change', 'return', 'refund',
    'card', 'upi', 'wallet', 'discount', 'promo', 'coupon', 'advance'
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const hasIgnore = ignoreLabels.some(label => lower.includes(label));
    const hasTotalLabel = totalLabels.some(label => lower.includes(label));

    if (!/\d/.test(line) || hasIgnore && !hasTotalLabel) continue;

    const match = line.match(/(?:grand\s*total|total\s*amount|net\s*amount|amount\s*due|net\s*payable|payable|bill\s*amount|invoice\s*total|grand|total|amount|net\s*total)\s*[:\-]*\s*(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d{0,2})/i)
      || line.match(/(?:rs\.?|inr|₹)\s*([\d,]+\.?\d{0,2})(?:\s*(?:only|\/\-))?$/i)
      || line.match(/\b([\d,]+\.?\d{1,2})\b(?=\s*(?:only|\/\-)?$)/i);

    if (match) {
      const value = normalizeCurrencyNumber(match[1]);
      if (value !== null && value > 0 && value < 500000) {
        let score = 0;

        if (lower.includes('grand total')) score += 100;
        else if (lower.includes('total amount')) score += 95;
        else if (lower.includes('net amount')) score += 95;
        else if (lower.includes('amount due')) score += 90;
        else if (lower.includes('net payable')) score += 90;
        else if (lower.includes('payable')) score += 85;
        else if (lower.includes('bill amount')) score += 85;
        else if (lower.includes('invoice total')) score += 85;
        else if (lower.includes('total')) score += 80;
        else if (lower.includes('amount')) score += 60;

        if (hasIgnore) score -= 75;
        candidates.push({ line, value, score });
      }
    }
  }

  if (candidates.length === 0) {
    const fallbackNumbers = [];
    const numberPattern = /\b(\d{2,6}(?:\.\d{1,2})?)\b/g;
    let match;
    while ((match = numberPattern.exec(rawText)) !== null) {
      const value = normalizeCurrencyNumber(match[1]);
      if (value !== null && value > 10 && value < 100000) {
        const context = rawText.slice(Math.max(0, match.index - 30), match.index + 30).toLowerCase();
        const isIgnoredContext = ignoreLabels.some(label => context.includes(label));
        if (!isIgnoredContext) fallbackNumbers.push(value);
      }
    }

    if (fallbackNumbers.length > 0) {
      candidates.push({ value: Math.max(...fallbackNumbers), score: 10, line: 'fallback' });
    }
  }

  return candidates;
};

const parseReceiptWithRegex = (rawText) => {
  try {
    const lines = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let merchant = 'Unknown Store';
    let amount = 0;
    let date = new Date().toISOString().split('T')[0];
    let items = [];
    let category = 'Other';

    // ===== MERCHANT EXTRACTION =====
    const skipWords = [
      'gstin', 'gst', 'tax', 'invoice', 'bill', 'receipt', 'cash',
      'thank', 'visit', 'welcome', 'ph:', 'mob:', 'tel:', 'phone',
      'date', 'time', 'no:', 'no.', 'tab', 'table', 's.no', 'sl.no',
      'qty', 'rate', 'amt', 'amount', 'total', 'subtotal', 'grand',
      '***', '---', '===', 'www.', 'http', 'fssai', 'cin'
    ];

    for (let i = 0; i < Math.min(6, lines.length); i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();

      if (/^[\d\s.,:/-]+$/.test(line)) continue;
      if (line.length < 3 || line.length > 60) continue;

      const hasSkipWord = skipWords.some(word =>
        lineLower.startsWith(word) || lineLower === word
      );
      if (hasSkipWord) continue;

      if (/^\+?[\d\s\-()]{8,}$/.test(line)) continue;
      if (/^\d+[,\s]/.test(line) && line.length < 20) continue;

      if (/[a-zA-Z]/.test(line)) {
        merchant = line
          .replace(/[^a-zA-Z0-9\s&.'\-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 50);
        break;
      }
    }

    // ===== AMOUNT EXTRACTION =====
    const extractedCandidates = extractAmountCandidates(rawText);

    if (extractedCandidates.length > 0) {
      extractedCandidates.sort((a, b) => b.score - a.score || b.value - a.value);
      amount = extractedCandidates[0].value;
    }

    // ===== DATE EXTRACTION =====
    const datePatterns = [
      /(?:date|dt)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/,
      /\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/,
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})\b/,
    ];

    for (let pattern of datePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        const raw = match[1];
        const parts = raw.split(/[\/\-\.]/);
        try {
          if (parts.length === 3) {
            let day, month, year;
            if (parts[0].length === 4) {
              year = parts[0];
              month = parts[1].padStart(2, '0');
              day = parts[2].padStart(2, '0');
            } else {
              day = parts[0].padStart(2, '0');
              month = parts[1].padStart(2, '0');
              year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            }
            const parsed = new Date(`${year}-${month}-${day}`);
            if (!isNaN(parsed.getTime())) {
              date = `${year}-${month}-${day}`;
              break;
            }
          }
        } catch (e) {}
      }
    }

    // ===== ITEM EXTRACTION =====
    for (let line of lines) {
      const itemMatch = line.match(/^(\d+)\s+([A-Za-z][A-Za-z\s]{2,30})\s+[\d.]+/);
      if (itemMatch && itemMatch[2]) {
        const name = itemMatch[2].trim();
        if (name.length > 2 && !items.includes(name)) {
          items.push(name);
        }
      }
    }

    items = [...new Set(items)].slice(0, 10);

    // ===== CATEGORY DETECTION =====
    const textLower = rawText.toLowerCase();
    const merchantLower = merchant.toLowerCase();

    const categoryRules = {
      'Food & Dining': {
        merchantWords: ['restaurant', 'cafe', 'hotel', 'dhaba', 'kitchen', 'foods', 'food', 'eatery', 'dining', 'biryani', 'pizza', 'burger', 'diner', 'mess', 'canteen', 'bakery', 'sweets', 'nilayam', 'kiskinda', 'kfc', 'mcd', 'subway', 'dominos', 'barbeque'],
        textWords: ['restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'chicken', 'mutton', 'fish', 'biryani', 'dosa', 'idli', 'paratha', 'gravy', 'curry', 'roti', 'rice', 'thali', 'gravy', 'prawn', 'kulcha'],
      },
      'Groceries': {
        merchantWords: ['grocery', 'supermarket', 'mart', 'bazaar', 'market', 'stores', 'general', 'provision', 'departmental', 'kirana', 'dmart', 'bigbazaar', 'reliance fresh', 'more'],
        textWords: ['grocery', 'vegetables', 'fruits', 'milk', 'bread', 'eggs', 'butter', 'rice', 'dal', 'sugar', 'salt', 'flour', 'oil', 'masala', 'spices', 'cereal', 'atta', 'maida'],
      },
      'Medical': {
        merchantWords: ['pharmacy', 'medical', 'hospital', 'clinic', 'health', 'chemist', 'drugs', 'medicare', 'medicals', 'apollo', 'medplus'],
        textWords: ['medicine', 'tablet', 'capsule', 'syrup', 'injection', 'doctor', 'prescription', 'mg', 'ml', 'strip'],
      },
      'Transport': {
        merchantWords: ['petrol', 'fuel', 'filling', 'uber', 'ola', 'taxi', 'auto', 'bus', 'railway', 'metro', 'parking', 'pump'],
        textWords: ['petrol', 'diesel', 'fuel', 'litre', 'ltr', 'km', 'fare', 'toll', 'parking'],
      },
      'Entertainment': {
        merchantWords: ['cinema', 'movie', 'theatre', 'theater', 'multiplex', 'imax', 'gaming', 'sports', 'club', 'pvr', 'inox'],
        textWords: ['ticket', 'show', 'movie', 'game', 'entry', 'admission', 'screen'],
      },
      'Shopping': {
        merchantWords: ['mall', 'shop', 'store', 'fashion', 'clothing', 'apparel', 'boutique', 'garments', 'textile', 'lifestyle', 'myntra'],
        textWords: ['shirt', 'pant', 'dress', 'shoe', 'wear', 'cloth', 'garment', 'fashion', 'jeans', 'top', 'kurta'],
      },
      'Utilities': {
        merchantWords: ['electricity', 'water', 'gas', 'internet', 'phone', 'telecom', 'airtel', 'jio', 'bsnl', 'power', 'tneb', 'bescom'],
        textWords: ['bill', 'electricity', 'water', 'gas', 'recharge', 'internet', 'broadband', 'mobile', 'postpaid'],
      }
    };

    let scores = {};
    for (let cat of Object.keys(categoryRules)) {
      scores[cat] = 0;
    }

    for (let [cat, rules] of Object.entries(categoryRules)) {
      for (let word of rules.merchantWords) {
        if (merchantLower.includes(word)) {
          scores[cat] += 100;
        }
      }
      for (let word of rules.textWords) {
        if (textLower.includes(word)) {
          scores[cat] += 10;
        }
      }
    }

    let maxScore = 0;
    for (let [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        category = cat;
      }
    }

    if (maxScore === 0) category = 'Other';
    if (items.length === 0) items = ['Items not extracted'];

    console.log('=== PARSER RESULTS ===');
    console.log('Merchant:', merchant);
    console.log('Amount:', amount);
    console.log('Date:', date);
    console.log('Category:', category, '| Score:', maxScore);
    console.log('Items:', items);
    console.log('======================');

    return { merchant, date, amount, category, items };

  } catch (error) {
    console.error('Parse error:', error);
    return {
      merchant: 'Unknown Store',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'Other',
      items: ['Parse error']
    };
  }
};

module.exports = { parseReceiptWithRegex };