import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { DataContext } from "../../contexts/DataContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import CustomSelect from "../CustomSelect";
import Modal from "../Modal";
import { req, postReq } from "../../helper";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Card = styled.div`
  background: #000000;
  background: linear-gradient(to top left, #000000, #282828);
  padding: ${(props) => props.padding || "30px 25px"};
  margin: 12px 15px;
  border-radius: 12px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.644),
    0px 0px 25px rgba(0, 0, 0, 0.719);
  width: ${(props) => props.width};
  max-width: ${(props) => (props.maxWidth ? props.maxWidth : "95%")};
  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  border: 1px solid ${(props) => props.accent || "#00C9A7"}33;
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  flex: 1;
  min-width: 200px;
  margin: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px ${(props) => props.accent || "#00C9A7"}22;
  }
`;

function AccountingDashboard(props) {
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const { addToast } = useToasts();
  const [stats, setStats] = useState(null);
  
  // Create Year Modal
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const [newYear, setNewYear] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [activeYearId, setActiveYearId] = useState(null);

  const fetchYears = async () => {
    let resp = await req("accounting/fiscal-years/");
    if (resp) {
      let obj = { ...Data };
      obj.FiscalYears = resp;
      if (!Data.SelectedFiscalYear && resp.length > 0) {
        const currentYear = new Date().getFullYear();
        let currentYearObj = resp.find((y) => y.year === currentYear);
        let openYear = resp.find((y) => !y.is_locked) || currentYearObj || resp[0];
        obj.SelectedFiscalYear = openYear;
        setActiveYearId(openYear.id);
      } else if (Data.SelectedFiscalYear) {
        setActiveYearId(Data.SelectedFiscalYear.id);
      }
      setData(obj);
    }
  };

  useEffect(() => {
    if (User.logged && User.is_accounting_user) {
      fetchYears();
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeYearId || !Data.SelectedFiscalYear) return;
      let resp = await req(`accounting/stats/?year=${Data.SelectedFiscalYear.year}`);
      if (resp) {
        setStats(resp);
      }
    };
    if (activeYearId) {
      fetchStats();
    }
  }, [activeYearId]);

  const handleYearChange = (vs) => {
    let obj = { ...Data };
    if (vs.length > 0) {
      obj.SelectedFiscalYear = vs[0];
      setActiveYearId(vs[0].id);
    } else {
      obj.SelectedFiscalYear = null;
      setActiveYearId(null);
      setStats(null);
    }
    setData(obj);
  };

  const handleCreateYear = async () => {
    if (!newYear) return;
    setLoading(true);
    let resp = await postReq("accounting/fiscal-years/", { year: parseInt(newYear) });
    if (resp) {
      addToast("Année fiscale " + newYear + " créée", { appearance: "success", autoDismiss: true });
      setNewYear("");
      setCreateYearOpen(false);
      fetchYears();
    } else {
      addToast("Erreur de création", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const formatMoney = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " DH";
  };

  const yearOptions = (Data.FiscalYears || []).map((y) => ({
    ...y,
    label: String(y.year),
  }));

  const selectedYear = Data.SelectedFiscalYear;
  const isOpen = selectedYear ? !selectedYear.is_locked : false;

  return User.logged && User.is_accounting_user ? (
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
        {/* ── Gateway: Year Selector ── */}
        <div className="row">
          <Card width="95%" height="auto" padding="30px 30px">
            <h3 style={{ color: "#00C9A7", marginBottom: "25px", fontSize: "1.4em", textAlign: "center" }}>
              Comptabilité
            </h3>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <div style={{ width: "250px" }}>
                <CustomSelect
                  options={yearOptions}
                  changeFunc={handleYearChange}
                  label="label"
                  multi={false}
                  values={selectedYear ? yearOptions.filter((y) => y.id === selectedYear.id) : []}
                  fvalue="id"
                  placeholder="Choisir l'année..."
                  searchBy="label"
                  searchTerm="label"
                />
              </div>
              <button 
                className="btn-main" 
                style={{ borderRadius: "50%", width: "40px", height: "40px", padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={() => setCreateYearOpen(true)}
                title="Ajouter une année"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </Card>
        </div>

        {/* ── Active Year Banner ── */}
        {selectedYear && (
          <div className="row">
            <Card width="95%" height="auto" padding="15px 25px">
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                <span style={{ color: "var(--grey)", fontSize: "0.95em" }}>Année active :</span>
                <span style={{ color: "#00C9A7", fontWeight: "700", fontSize: "1.3em" }}>{selectedYear.year}</span>
                <span className={`accounting-badge ${isOpen ? "paid" : "unpaid"}`}>
                  {isOpen ? "Ouverte" : "Clôturée"}
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* ── Stats Cards ── */}
        {stats && selectedYear && (
          <Fragment>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", padding: "0 15px", maxWidth: "95%", margin: "0 auto" }}>
              <StatCard accent="#00C9A7">
                <p style={{ color: "var(--grey)", fontSize: "0.8em", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                  Valeur Marchandise
                </p>
                <p style={{ color: "#00C9A7", fontSize: "1.8em", fontWeight: "700" }}>
                  {formatMoney(stats.valeur_marchandise)}
                </p>
              </StatCard>
              <StatCard accent="#00B4D8">
                <p style={{ color: "var(--grey)", fontSize: "0.8em", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                  Valeur Vendue
                </p>
                <p style={{ color: "#00B4D8", fontSize: "1.8em", fontWeight: "700" }}>
                  {formatMoney(stats.valeur_vendue)}
                </p>
              </StatCard>
              <StatCard accent="#b187ff">
                <p style={{ color: "var(--grey)", fontSize: "0.8em", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                  Profit
                </p>
                <p style={{ color: "#b187ff", fontSize: "1.8em", fontWeight: "700" }}>
                  {formatMoney(stats.profit)}
                </p>
              </StatCard>
            </div>

            {/* ── Debt Tables ── */}
            <div className="row" style={{ marginTop: "10px" }}>
              <Card width="46%" height="auto" minHeight="300px">
                <h4 style={{ color: "var(--red)", marginBottom: "15px", fontSize: "1em", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Dettes Fournisseurs
                </h4>
                <div id="table-wrapper">
                  <table id="status-table">
                    <thead>
                      <tr>
                        <th>Fournisseur</th>
                        <th>Montant Dû</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.debts_providers && stats.debts_providers.length > 0 ? (
                        stats.debts_providers.map((d, i) => (
                          <tr key={i}>
                            <td>{d.name || d.provider_name}</td>
                            <td style={{ color: "var(--red)", fontWeight: "600" }}>{formatMoney(d.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="2" style={{ color: "var(--grey)", textAlign: "center" }}>Aucune dette</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card width="46%" height="auto" minHeight="300px">
                <h4 style={{ color: "var(--green)", marginBottom: "15px", fontSize: "1em", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Dettes Clients
                </h4>
                <div id="table-wrapper">
                  <table id="status-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Montant Dû</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.debts_clients && stats.debts_clients.length > 0 ? (
                        stats.debts_clients.map((d, i) => (
                          <tr key={i}>
                            <td>{d.name || d.client_name}</td>
                            <td style={{ color: "var(--green)", fontWeight: "600" }}>{formatMoney(d.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="2" style={{ color: "var(--grey)", textAlign: "center" }}>Aucune dette</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  ) : (
    <Redirect to={{ pathname: "/appfront/app/pannel", state: { error: true, msg: "Accès refusé" } }} />
  );
}

export default AccountingDashboard;
