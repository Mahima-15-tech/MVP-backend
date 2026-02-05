export default function AlertModal({ alert, onClose }) {
    if (!alert) return null;
  
    const { userId, location, createdAt, type } = alert;
  
    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="modal-close" onClick={onClose}>✕</button>
  
          <h2>Alert Details</h2>
  
          <div className="modal-section">
            <p><strong>User:</strong> {userId?.name || "—"}</p>
            <p><strong>Phone:</strong> {userId?.phone || "—"}</p>
            <p><strong>Type:</strong> {type}</p>
            <p><strong>Triggered At:</strong> {new Date(createdAt).toLocaleString()}</p>
          </div>
  
          <div className="modal-section">
            <h4>Last Known Location</h4>
  
            {location?.lat ? (
              <iframe
                title="map"
                width="100%"
                height="260"
                style={{ borderRadius: 12, border: "none" }}
                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              />
            ) : (
              <p>No location available</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  