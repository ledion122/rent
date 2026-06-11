const calculateBookingPrice = (dailyPrice, startDate, endDate, weeklyDiscount, monthlyDiscount) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (days <= 0) return 0;

  let total = dailyPrice * days;

  if (days >= 30 && monthlyDiscount > 0) {
    total = total - (total * monthlyDiscount) / 100;
  } else if (days >= 7 && weeklyDiscount > 0) {
    total = total - (total * weeklyDiscount) / 100;
  }

  return Math.round(total * 100) / 100;
};

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
};

module.exports = { calculateBookingPrice, formatDate, slugify, paginate };
