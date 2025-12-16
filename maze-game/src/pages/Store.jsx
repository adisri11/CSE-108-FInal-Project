import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/Store.css";

export default function Store() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getUser();
        setUser(userData);
        const storeItems = await api.getStoreItems();
        setItems(storeItems);
      } catch (err) {
        setError("Failed to load store");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleBuy = async (itemId, price) => {
    try {
      const result = await api.buyItem(itemId, price);
      setUser({
        ...user,
        tokens: result.tokens,
        inventory: result.inventory,
      });
      alert(`Purchased ${items.find(i => i.id === itemId).name}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectCharacter = async (characterId) => {
    try {
      const result = await api.setCharacter(characterId);
      setUser({
        ...user,
        character: result.character
      });
      alert("Character selected!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="store-container">Loading...</div>;
  if (error) return <div className="store-container error">{error}</div>;

  const ownedItems = user?.inventory || [];
  const isCharacterOwned = (characterId) => ownedItems.includes(characterId);
  const activeCharacterItem = items.find(i => i.id === user?.character);

  return (
    <div className="store-container">
      <div className="store-card">
        <h1>Item Store</h1>
        <p>
          You have <strong>{user?.tokens || 0}</strong> tokens.
        </p>

        <h2>Your Active Character</h2>
        <div className="active-character">
          {activeCharacterItem ? (
            <>
              <img 
                src={`/assets/elements/${activeCharacterItem.image}`}
                alt={activeCharacterItem.name}
                className="active-character-image"
              />
              <p>Current: <strong>{activeCharacterItem.name}</strong></p>
            </>
          ) : (
            <p>Current: <strong>None</strong></p>
          )}
        </div>

        <h2>Characters</h2>
        <div className="items-grid">
          {items.map((item) => {
            const owned = isCharacterOwned(item.id);
            const isActive = user?.character === item.id;
            
            return (
              <div key={item.id} className="store-item">
                <div className="store-item-image">
                  <img 
                    src={`/assets/elements/${item.image}`}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/assets/elements/jack_o_lantern.png';
                    }}
                  />
                </div>
                <span className="store-item-name">{item.name}</span>
                <span className="store-item-price">{item.price} tokens</span>
                {owned ? (
                  <button
                    onClick={() => handleSelectCharacter(item.id)}
                    disabled={isActive}
                    style={{
                      backgroundColor: isActive ? "#4CAF50" : "#2196F3",
                      cursor: isActive ? "default" : "pointer"
                    }}
                  >
                    {isActive ? "Active" : "Select"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id, item.price)}
                    disabled={user?.tokens < item.price}
                  >
                    {user?.tokens >= item.price ? "Buy" : "Not Enough Tokens"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <h2>Your Inventory</h2>
        <div className="inventory-box">
          {user?.inventory && user.inventory.length > 0 ? (
            <ul>
              {user.inventory.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>You have no items yet.</p>
          )}
        </div>

        <p style={{ marginTop: "20px" }}>
          <button onClick={() => navigate("/game")}>Back to Game</button>
        </p>
      </div>
    </div>
  );
}