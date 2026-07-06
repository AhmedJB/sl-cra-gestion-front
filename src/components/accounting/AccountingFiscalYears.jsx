import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { DataContext } from "../../contexts/DataContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import Modal from "../Modal";
import { req, postReq } from "../../helper";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLock } from "@fortawesome/free-solid-svg-icons";

const Card = styled.div`
  background: #000000;
  background: linear-gradient(to top left, #000000, #282828);
  padding: 30px 25px;
  margin: 12px 15px;
  border-radius: 12px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.644),
    0px 0px 25px rgba(0, 0, 0, 0.719);
  width: ${(props) => props.width};
  max-width: ${(props) => (props.maxWidth ? props.maxWidth : "95%")};
  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
`;

function AccountingFiscalYears(props) {
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const [newYear, setNewYear] = useState("");

  const fetchYears = async () => {
    let resp = await req("accounting/fiscal-years");
    if (resp) {
      let obj = { ...Data };
      obj.FiscalYears = resp;
      setData(obj);
    }
  };

  useEffect(() => {
    if (User.logged && User.is_accounting_user) {
      fetchYears();
    }
  }, []);

  const handleCreateYear = async () => {
    if (!newYear) return;
    setLoading(true);
    let resp = await postReq("accounting/fiscal-years/", { year: parseInt(newYear) });
    if (resp) {
      addToast("Année fiscale créée", { appearance: "success", autoDismiss: true });
      fetchYears();
      setNewYear("");
      setCreateYearOpen(false);
    } else {
      addToast("Erreur de création", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const handleClose = async (id) => {
    setLoading(true);
    let resp = await postReq(`accounting/fiscal-years/${id}/close/`, { create_next_year: true });
    if (resp) {
      addToast("Année clôturée", { appearance: "success", autoDismiss: true });
      let obj = { ...Data };
      if (obj.FiscalYears) {
        obj.FiscalYears = obj.FiscalYears.map(y =>
          y.id === id ? { ...y, is_locked: true, closed_at: new Date().toISOString() } : y
        );
      }
      if (resp.next_year) {
        const exists = obj.FiscalYears.some(y => y.id === resp.next_year.id);
        if (!exists) {
          obj.FiscalYears = [...obj.FiscalYears, resp.next_year];
        }
        obj.SelectedFiscalYear = resp.next_year;
      }
      setData(obj);
    } else {
      addToast("Erreur de clôture", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const html = (
    <Fragment>
      <AnimateNav />
      
      {/* ── Create Year Modal ── */}
      <Modal open={createYearOpen} closeFunction={setCreateYearOpen}>
        <h2 style={{ color: "var(--second)" }}>Nouvelle Année Fiscale</h2>
        <div className="form" style={{ marginTop: "20px" }}>
          <div style={{ margin: "10px 0" }}>
            <label>Année (ex: 2026)</label>
            <input
              type="number"
              className="field"
              style={{ width: "100%", marginTop: "5px" }}
              placeholder="Saisissez l'année..."
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
          </div>
          <div className="filtre-row" style={{ marginTop: "20px", justifyContent: "flex-end" }}>
            <button className="btn-main" onClick={handleCreateYear} disabled={loading}>
              Créer
            </button>
            <button
              className="btn-main"
              style={{ borderColor: "var(--red)", color: "var(--red)" }}
              onClick={() => setCreateYearOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>

      <div className="pannel-container">
        <div className="row">
          <Card width="95%" height="auto" minHeight="400px">
            <div className="title-select-row">
              <h3 className="card-title text-center inline" style={{ color: "#0077B6", margin: 0 }}>
                Années Fiscales
              </h3>
              <div className="inline">
                <button 
                  className="btn-main" 
                  onClick={() => setCreateYearOpen(true)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} /> Créer l'année
                </button>
              </div>
            </div>

            <div id="table-wrapper">
              <table id="status-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Année</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Data.FiscalYears && Data.FiscalYears.map((year) => {
                    const isOpen = !year.is_locked;
                    return (
                      <tr key={year.id}>
                        <td>{year.id}</td>
                        <td style={{ fontWeight: "600", color: "#fff" }}>{year.year}</td>
                        <td>
                          <span className={`accounting-badge ${isOpen ? "paid" : "unpaid"}`}>
                            {isOpen ? "Ouverte" : "Clôturée"}
                          </span>
                        </td>
                        <td>
                          {isOpen && (
                            <button
                              className="btn-main"
                              style={{ color: "var(--red)", borderColor: "var(--red)" }}
                              onClick={() => handleClose(year.id)}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faLock} /> Clôturer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Fragment>
  );

  return User.logged && User.is_accounting_user ? html : (
    <Redirect to={{ pathname: "/appfront/app/pannel", state: { error: true, msg: "Accès refusé" } }} />
  );
}

export default AccountingFiscalYears;
