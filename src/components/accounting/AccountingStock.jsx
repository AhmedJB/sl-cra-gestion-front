import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { DataContext } from "../../contexts/DataContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import { req, postReq, patchReq } from "../../helper";
import { useToasts } from "react-toast-notifications";
import Modal from "../Modal";
import CustomSelect from "../CustomSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faEdit,
  faCheck,
  faTimes,
  faFileImport,
} from "@fortawesome/free-solid-svg-icons";

const Card = styled.div`
  background: #000000;
  background: -webkit-linear-gradient(bottom right, #000000, #282828);
  background: -moz-linear-gradient(bottom right, #000000, #282828);
  background: linear-gradient(to top left, #000000, #282828);
  padding: 30px 25px;
  margin: 20px 15px;
  border-radius: 12px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.644),
    0px 0px 25px rgba(0, 0, 0, 0.719);
  width: ${(props) => props.width};
  max-width: ${(props) => (props.maxWidth ? props.maxWidth : "95%")};
  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
`;

function AccountingStock(props) {
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState([]);

  // Bulk Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [globalProducts, setGlobalProducts] = useState([]);
  const [selectedForImport, setSelectedForImport] = useState({}); // { [id]: { name, quantity } }
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Inline edit
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ initial_qty: 0 });

  const selectedYear = Data.SelectedFiscalYear;

  // ───── Fetch snapshots ─────
  const fetchSnapshots = async () => {
    if (!selectedYear) return;
    let resp = await req(`accounting/snapshots/?year=${selectedYear.year}`);
    if (resp) {
      setSnapshots(resp);
    }
  };

  useEffect(() => {
    if (User.logged && User.is_accounting_user && selectedYear) {
      fetchSnapshots();
    }
  }, [selectedYear]);

  // ───── Import Products ─────
  const openImportModal = async () => {
    setSelectedForImport({});
    setSearchQuery("");
    setCurrentPage(1);
    setImportOpen(true);

    if (globalProducts.length === 0) {
      setFetchingProducts(true);
      let resp = await req("silentpd");
      if (resp && Array.isArray(resp)) {
        const flat = resp.map((p) => {
          if (p.product) {
            return {
              id: p.product.id,
              name: p.product.name + " (" + p.product.p_id + ")",
            };
          } else {
            return {
              id: p.id,
              name: p.name + (p.p_id ? " (" + p.p_id + ")" : ""),
            };
          }
        });
        setGlobalProducts(flat);
      }
      setFetchingProducts(false);
    }
  };

  const handleToggleProduct = (product, isChecked) => {
    const updated = { ...selectedForImport };
    if (isChecked) {
      updated[product.id] = { name: product.name, quantity: 0 };
    } else {
      delete updated[product.id];
    }
    setSelectedForImport(updated);
  };

  const handleBulkQtyChange = (product, value) => {
    const updated = { ...selectedForImport };
    const qty = parseInt(value) || 0;
    // Auto-select if a value is typed
    updated[product.id] = { name: product.name, quantity: qty };
    setSelectedForImport(updated);
  };

  const handleSubmitImport = async () => {
    if (!selectedYear) return;
    const selectedIds = Object.keys(selectedForImport);
    if (selectedIds.length === 0) {
      addToast("Sélectionnez au moins un produit", { appearance: "warning", autoDismiss: true });
      return;
    }
    const payload = {
      items: selectedIds.map((id) => ({ product_id: parseInt(id), quantity: selectedForImport[id].quantity })),
    };
    setLoading(true);
    let resp = await postReq(`accounting/fiscal-years/${selectedYear.id}/initialize/`, payload);
    if (resp) {
      addToast("Produits importés avec succès", { appearance: "success", autoDismiss: true });
      setImportOpen(false);
      setSelectedForImport({});
      fetchSnapshots();
    } else {
      addToast("Erreur d'import", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  // ───── Inline Edit ─────
  const startEdit = (snap) => {
    setEditingId(snap.id);
    setEditValues({ initial_qty: snap.initial_qty });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (snapId) => {
    setLoading(true);
    let resp = await patchReq(`accounting/snapshots/${snapId}/`, editValues);
    if (resp) {
      addToast("Mis à jour", { appearance: "success", autoDismiss: true });
      setEditingId(null);
      fetchSnapshots();
    } else {
      addToast("Erreur", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const html = (
    <Fragment>
      <AnimateNav />

      {/* Import Modal */}
      <Modal open={importOpen} closeFunction={setImportOpen}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ color: "var(--second)", textAlign: "center", marginBottom: "5px" }}>Importer des Produits</h2>
          <p style={{ color: "var(--text)", fontSize: "0.9em", marginBottom: "20px", textAlign: "center" }}>
            Sélectionnez les produits pour l'année {selectedYear?.year}. ({Object.keys(selectedForImport).length} sélectionnés)
          </p>

          {fetchingProducts ? (
            <div style={{ padding: "30px", color: "var(--purple)", fontWeight: "600", textAlign: "center" }}>
              Chargement du catalogue...
            </div>
          ) : (
            <>
              <input
                type="text"
                className="field"
                placeholder="Rechercher par nom ou ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ width: "100%", maxWidth: "400px", marginBottom: "15px", textAlign: "center" }}
              />

              <div style={{ width: "100%", maxHeight: "350px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px" }}>
                <table id="status-table" style={{ width: "100%" }}>
                  <thead style={{ position: "sticky", top: "-10px", backgroundColor: "#1e1e1e", zIndex: 1 }}>
                    <tr>
                      <th style={{ textAlign: "center", width: "50px" }}>✔</th>
                      <th style={{ textAlign: "left", paddingLeft: "15px" }}>Produit</th>
                      <th style={{ textAlign: "center", width: "150px" }}>Qté Initiale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = globalProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);

                      if (filtered.length === 0) {
                        return <tr><td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>Aucun produit trouvé</td></tr>;
                      }

                      return (
                        <>
                          {paginated.map((product) => {
                            const isSelected = !!selectedForImport[product.id];
                            return (
                              <tr key={product.id}>
                                <td style={{ textAlign: "center" }}>
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={(e) => handleToggleProduct(product, e.target.checked)}
                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                  />
                                </td>
                                <td style={{ textAlign: "left", paddingLeft: "15px" }}>{product.name}</td>
                                <td style={{ textAlign: "center" }}>
                                  <input 
                                    type="number" 
                                    className="field" 
                                    style={{ width: "80px", textAlign: "center", margin: "0 auto", display: "block" }} 
                                    value={isSelected ? selectedForImport[product.id].quantity : ""} 
                                    onChange={(e) => handleBulkQtyChange(product, e.target.value)}
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                          
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan="3">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "10px" }}>
                                  <button className="btn-main" style={{ padding: "5px 15px", width: "auto" }} disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Précédent</button>
                                  <span style={{ fontSize: "0.9em", color: "var(--text)" }}>Page {currentPage} sur {totalPages}</span>
                                  <button className="btn-main" style={{ padding: "5px 15px", width: "auto" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Suivant</button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "row", marginTop: "25px", justifyContent: "center", width: "100%", gap: "20px" }}>
            <button className="btn-main" style={{ width: "auto", padding: "10px 30px", margin: "0" }} onClick={handleSubmitImport} disabled={loading || fetchingProducts}>
              Valider l'Import ({Object.keys(selectedForImport).length})
            </button>
            <button className="btn-main" style={{ width: "auto", padding: "10px 30px", margin: "0", borderColor: "var(--red)", color: "var(--red)" }} onClick={() => setImportOpen(false)}>Annuler</button>
          </div>
        </div>
      </Modal>

      <div className="pannel-container">
        {!selectedYear ? (
          <div className="row">
            <Card width="90%" height="auto">
              <p className="text-center" style={{ color: "var(--red)" }}>
                ⚠ Veuillez d'abord sélectionner une année fiscale sur le <strong>Tableau de Bord</strong>.
              </p>
            </Card>
          </div>
        ) : (
          <div className="row">
            <Card width="95%" height="auto" minHeight="500px">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h3 className="card-title" style={{ color: "#00D4AA", margin: 0 }}>
                  Stock Comptable — {selectedYear.year}
                </h3>
                {!selectedYear.is_locked && (
                  <button className="btn-main" onClick={openImportModal} disabled={loading}>
                    <FontAwesomeIcon icon={faFileImport} /> Importer Produits
                  </button>
                )}
              </div>

              <div id="table-wrapper">
                <table id="status-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Qté Initiale</th>
                      <th>Qté Courante</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots && snapshots.length > 0 ? (
                      snapshots.map((snap) => (
                        <tr key={snap.id}>
                          <td>{snap.product_name || `Produit #${snap.product}`}</td>
                          <td>
                            {editingId === snap.id ? (
                              <input type="number" className="field" style={{ width: "80px" }} value={editValues.initial_qty} onChange={(e) => setEditValues({ ...editValues, initial_qty: parseInt(e.target.value) || 0 })} />
                            ) : snap.initial_qty}
                          </td>
                          <td>
                            {editingId === snap.id ? (
                              <span style={{ padding: "0 10px", color: "var(--text)" }}>{snap.current_qty}</span>
                            ) : snap.current_qty}
                          </td>
                          <td>
                            {editingId === snap.id ? (
                              <>
                                <FontAwesomeIcon icon={faCheck} style={{ cursor: "pointer", color: "var(--green)", marginRight: "15px", fontSize: "1.2em" }} onClick={() => saveEdit(snap.id)} />
                                <FontAwesomeIcon icon={faTimes} style={{ cursor: "pointer", color: "var(--red)", fontSize: "1.2em" }} onClick={cancelEdit} />
                              </>
                            ) : (
                              <FontAwesomeIcon icon={faEdit} style={{ cursor: "pointer", color: "var(--purple)", fontSize: "1.1em" }} onClick={() => startEdit(snap)} />
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">Aucun produit — Utilisez "Importer Produits" pour commencer</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Fragment>
  );

  return User.logged && User.is_accounting_user ? html : (
    <Redirect to={{ pathname: "/appfront/app/pannel", state: { error: true, msg: "Accès refusé" } }} />
  );
}

export default AccountingStock;
