export default function PastContactsModal({ history, onClose }) {

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
  
        <div className="bg-white w-4/5 max-w-4xl rounded-2xl shadow-2xl p-8 relative">
  
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
  
          <h2 className="text-2xl font-bold mb-6">
            Past Contact History
          </h2>
  
          <div className="max-h-[500px] overflow-y-auto">
  
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th>Phone</th>
                  <th>Relation</th>
                  <th>Action</th>
                  <th>Consent</th>
                  <th>Date</th>
                </tr>
              </thead>
  
              <tbody>
                {history?.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.name}</td>
                    <td>{item.phone}</td>
                    <td>{item.relation}</td>
                    <td>
                      <ActionBadge action={item.action} />
                    </td>
                    <td>
                      <ConsentBadge status={item.consentStatus || "PENDING"} />
                    </td>
                    <td>
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
  
          </div>
  
        </div>
      </div>
    );
  }


  function ActionBadge({ action }) {

    const colors = {
      ADDED: "bg-green-100 text-green-600",
      UPDATED: "bg-blue-100 text-blue-600",
      DELETED: "bg-red-100 text-red-600"
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[action]}`}>
        {action}
      </span>
    );
  }

  function ConsentBadge({ status }) {

    const colors = {
      APPROVED: "bg-green-100 text-green-600",
      REJECTED: "bg-red-100 text-red-600",
      OPT_OUT: "bg-yellow-100 text-yellow-700",
      PENDING: "bg-gray-100 text-gray-600"
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}>
        {status}
      </span>
    );
  }