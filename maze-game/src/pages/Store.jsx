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

  const handleBuy = async (itemName, price) => {
    try {
      const result = await api.buyItem(itemName, price);
      setUser({
        ...user,
        tokens: result.tokens,
        inventory: result.inventory,
      });
      alert(`Purchased ${itemName}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="store-container">Loading...</div>;
  if (error) return <div className="store-container error">{error}</div>;

  return (
    <div className="store-container">
      <div className="store-card">
        <h1>Item Store</h1>

        <p>
          You have <strong>{user?.tokens || 0}</strong> tokens.
        </p>

        <h2>Available Items</h2>

        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="store-item">
              <span className="store-item-name">{item.name}</span>
              <span className="store-item-price">{item.price} tokens</span>

              <button
                onClick={() => handleBuy(item.name, item.price)}
                disabled={user?.tokens < item.price}
              >
                {user?.tokens >= item.price ? "Buy" : "Not Enough Tokens"}
              </button>
            </div>
          ))}
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
