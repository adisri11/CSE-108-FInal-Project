// API Service for communicating with Flask backend
// Use environment variable for API URL, default to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? (() => { throw new Error('VITE_API_URL environment variable is required for production'); })()
    : "http://localhost:5000"
);

export const api = {
  // Get current user data
  async getUser() {
    const response = await fetch(`${API_BASE}/api/user`, {
      credentials: "include", // Include cookies for session
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // Set user's active character
  async setCharacter(characterId) {
    const response = await fetch(`${API_BASE}/api/user/character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        character: characterId,
      }),
    });
    if (!response.ok) throw new Error("Failed to set character");
    return response.json();
  },

  // Complete a maze and earn tokens
  async completeMaze(mazeType = "fall", tokensEarned = 10) {
    const response = await fetch(`${API_BASE}/api/complete-maze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        maze: mazeType,
        tokens: tokensEarned,
      }),
    });
    if (!response.ok) throw new Error("Failed to complete maze");
    return response.json();
  },

  // Get all store items
  async getStoreItems() {
    const response = await fetch(`${API_BASE}/api/store/items`);
    if (!response.ok) throw new Error("Failed to fetch store items");
    return response.json();
  },

  // Buy an item from the store
  async buyItem(itemName, price) {
    const response = await fetch(`${API_BASE}/api/store/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        item: itemName,
        price: price,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to buy item");
    }
    return response.json();
  },
};

