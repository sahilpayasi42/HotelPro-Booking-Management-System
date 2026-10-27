/**
 * Resolves room image from database upload or category-matched luxury photography.
 * Alternates between category-appropriate variations using room number/id to avoid repetitive identical images.
 *
 * @param {Object} room - Room document
 * @returns {string} Image URL
 */
export const getRoomImage = (room) => {
  // 1. Highest Priority: Uploaded custom room image
  if (room?.images && room.images.length > 0) {
    const img = room.images[0];
    return img.startsWith('http') ? img : `http://localhost:5000${img}`;
  }

  // 2. Category identification
  const categoryName = (
    typeof room?.category === 'object' ? room?.category?.name : room?.category || ''
  ).toLowerCase();

  // Deterministic variation selector based on room number digits or id
  const numStr = String(room?.roomNumber || room?._id || '0');
  const lastDigit = parseInt(numStr.replace(/\D/g, '').slice(-1) || '0', 10);
  const useAlt = lastDigit % 2 === 0;

  if (categoryName.includes('presidential')) {
    return '/images/presidential.jpg';
  }

  if (categoryName.includes('suite')) {
    return useAlt ? '/images/suite-alt.jpg' : '/images/suite.jpg';
  }

  if (categoryName.includes('deluxe')) {
    return useAlt ? '/images/deluxe-alt.jpg' : '/images/deluxe.jpg';
  }

  // Default Standard Rooms
  return useAlt ? '/images/standard-alt.jpg' : '/images/standard.jpg';
};

/**
 * Graceful error handler for broken or unreachable image URLs.
 */
export const handleImageError = (event, fallback = '/images/standard.jpg') => {
  if (!event.currentTarget.src.endsWith(fallback)) {
    event.currentTarget.src = fallback;
  }
};

/**
 * Returns accessible human-readable and styled status badge classes.
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'available':
      return 'badge-status-available';
    case 'occupied':
      return 'badge-status-occupied';
    case 'cleaning':
      return 'badge-status-cleaning';
    case 'maintenance':
      return 'badge-status-maintenance';
    default:
      return 'badge-status-maintenance';
  }
};
