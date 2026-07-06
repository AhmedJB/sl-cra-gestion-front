import React, { useEffect, useState } from "react";
import { req, postReq } from "../../helper";
import CustomSelect from "../CustomSelect";

const PriceEvolution = ({ productId }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  useEffect(() => {
    async function fetchClients() {
      let resp = await req("client/");
      if (resp) {
        setClients(resp);
      }
    }
    fetchClients();
  }, []);

  const handleClientChange = async (val) => {
    if (val && val.length > 0) {
      const clientId = val[0].id;
      setSelectedClient(clientId);
      setLoading(true);
      const body = {
        client_id: clientId,
        product_id: productId,
      };
      const resp = await postReq("price-evolution", body);
      if (resp) {
        setEvolutionData(resp);
      } else {
        setEvolutionData([]);
      }
      setLoading(false);
    } else {
      setSelectedClient(null);
      setEvolutionData([]);
    }
  };

  return (
    <div className="modal-input">
      <div className="modal-input-row">
        <CustomSelect
          options={clients}
          changeFunc={handleClientChange}
          label="name"
          fvalue="id"
          placeholder="Choisir un Client"
          multi={false}
          searchBy="name"
        />
      </div>

      {loading && <div className="lds-facebook"><div></div><div></div><div></div></div>}

      {!loading && selectedClient && evolutionData.length > 0 && (
        <div id="table-wrapper">
          <table id="status-table">
            <tbody>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Quantité</th>
                <th>Prix Vente</th>
                <th>Prix Achat</th>
              </tr>
              {evolutionData.map((e, i) => (
                <tr key={`evolution-${i}`}>
                  <td>{e.order_id}</td>
                  <td>{new Date(e.date).toLocaleDateString("fr-FR", options)}</td>
                  <td>{e.quantity}</td>
                  <td>{e.price_sold}</td>
                  <td>{e.price_bought}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && selectedClient && evolutionData.length === 0 && (
        <h3>Aucune donnée trouvée pour ce client et ce produit.</h3>
      )}
    </div>
  );
};

export default PriceEvolution;
