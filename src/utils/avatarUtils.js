/**
 * Avatar utilities for generating and managing avatars
 */

// Array of avatar image URLs
const AVATAR_URLS = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/women/1.jpg",
  "https://randomuser.me/api/portraits/men/2.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/women/3.jpg",
  "https://randomuser.me/api/portraits/men/4.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/women/5.jpg",
];

/**
 * Generates default avatar options for the application
 * @returns {Array} - Array of avatar objects with id, name, src, and requiredPoints
 */
export const generateDefaultAvatars = () => {
  return [
    { id: 'default', name: 'Başlangıç', src: 'https://placehold.co/100x100?text=Default', requiredPoints: 0 },
    { id: 'bronze', name: 'Bronz', src: 'https://placehold.co/100x100?text=Bronze', requiredPoints: 100 },
    { id: 'silver', name: 'Gümüş', src: 'https://placehold.co/100x100?text=Silver', requiredPoints: 300 },
    { id: 'gold', name: 'Altın', src: 'https://placehold.co/100x100?text=Gold', requiredPoints: 600 },
    { id: 'platinum', name: 'Platin', src: 'https://placehold.co/100x100?text=Platinum', requiredPoints: 1000 },
    { id: 'diamond', name: 'Elmas', src: 'https://placehold.co/100x100?text=Diamond', requiredPoints: 2000 },
  ];
};

/**
 * Generates default friends for new users
 * @returns {Array} - Array of friend objects
 */
export const generateDefaultFriends = () => {
  return [
    { id: 'f1', name: 'Ahmet Yılmaz', points: 850, weeklyPoints: 75, avatar: 'https://placehold.co/100x100?text=AY', streak: 15 },
    { id: 'f2', name: 'Zeynep Kaya', points: 1200, weeklyPoints: 120, avatar: 'https://placehold.co/100x100?text=ZK', streak: 22 },
    { id: 'f3', name: 'Mehmet Demir', points: 650, weeklyPoints: 45, avatar: 'https://placehold.co/100x100?text=MD', streak: 7 },
    { id: 'f4', name: 'Ayşe Yıldız', points: 920, weeklyPoints: 95, avatar: 'https://placehold.co/100x100?text=AYL', streak: 12 },
    { id: 'f5', name: 'Can Öztürk', points: 1450, weeklyPoints: 180, avatar: 'https://placehold.co/100x100?text=CO', streak: 30 },
  ];
};

/**
 * Generates a new avatar URL for a friend based on their name
 * @param {string} name - The friend's name
 * @returns {string} - The avatar URL
 */
export const generateNewFriendAvatar = (name) => {
  // Use the name to deterministically select an avatar
  // This ensures the same name always gets the same avatar
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = nameHash % AVATAR_URLS.length;
  return AVATAR_URLS[index];
};

/**
 * Gets a random avatar URL from the available avatars
 * @returns {string} - A random avatar URL
 */
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * AVATAR_URLS.length);
  return AVATAR_URLS[randomIndex];
};

/**
 * Generates an initial-based avatar for users without a profile picture
 * @param {string} name - The user's name
 * @param {string} bgColor - Background color (optional)
 * @returns {string} - Data URL for the avatar
 */
export const generateInitialsAvatar = (name, bgColor = '#3b82f6') => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = 200;
  canvas.height = 200;
  
  // Draw background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text
  context.font = 'bold 80px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Get initials
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  context.fillText(initials, canvas.width / 2, canvas.height / 2);
  
  // Return data URL
  return canvas.toDataURL('image/png');
}; 