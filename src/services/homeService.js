// Mock service layer — replace with real API calls later

export function getTodayOutfit() {
  return {
    top: 'White T-Shirt',
    bottom: 'Blue Jeans',
    footwear: 'White Sneakers',
  };
}

export function getWeeklyPlan() {
  return [
    { day: 'Mon', outfit: 'Casual' },
    { day: 'Tue', outfit: 'Formal' },
    { day: 'Wed', outfit: 'Sporty' },
    { day: 'Thu', outfit: 'Streetwear' },
    { day: 'Fri', outfit: 'Casual' },
  ];
}
