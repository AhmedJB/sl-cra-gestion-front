import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { DataContext } from "../../contexts/DataContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import Modal from "../Modal";
import { req, postReq, postWithError, deleteWithError } from "../../helper";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLock,
  faLockOpen,
  faTrashAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCalendar,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const Card = styled.div`
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

const WarningBanner = styled.div`
  background: rgba(255,165,0,0.08);
  border: 1px solid rgba(255,165,0,0.2);
  border-radius: 10px;
  padding: 16px;
  margin: 12px 15px;
  max-width: 95%;
  color: orange;
  font-size: 0.85rem;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  line-height: 1.5;
  a { color: var(--second); cursor: pointer; text-decoration: underline; }
`;

const InfoBanner = styled.div`
  background: rgba(0,180,216,0.06);
  border: 1px solid rgba(0,180,216,0.15);
  border-radius: 10px;
  padding: 16px;
  margin: 12px 15px;
  max-width: 95%;
  color: var(--second);
  font-size: 0.85rem;
  display: flex;
  gap: 12px;
  line-height: 1.5;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  &.open { background: rgba(0,201,167,0.15); color: #00C9A7; border: 1px solid rgba(0,201,167,0.3); }
  &.locked { background: rgba(255,0,0,0.12); color: var(--red); border: 1px solid rgba(255,0,0,0.2); }
  &.empty { background: rgba(255,165,0,0.12); color: orange; border: 1px solid rgba(255,165,0,0.2); }
`;

function AccountingFiscalYears(props) {
  const [User] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const [newYear, setNewYear] = useState("");

  // Close modal — explicit confirmation popup
  const [closeTarget, setCloseTarget] = useState(null);
  const [createNext, setCreateNext] = useState(true);
  const [closeAck, setCloseAck] = useState(false);
  const [closeConfirmText, setCloseConfirmText] = useState("");

  // Unlock modal
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlockReason, setUnlockReason] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteForce, setDeleteForce] = useState(false);

  const currentCalendarYear = new Date().getFullYear();

  const fetchYears = async () => {
    let resp = await req("accounting/fiscal-years/");
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

  // Shared helpers from ../../helper (same api base as req/postReq,
  // with 401 refresh + { ok, status, data } so backend errors surface).
  // Previously these were local fetch() calls hardcoded to
  // http://127.0.0.1:8000/api/ — broken in production (gestionapp host).

  const handleCreateYear = async () => {
    const y = parseInt(newYear, 10);
    if (!y || isNaN(y)) {
      addToast("Année invalide", { appearance: "warning", autoDismiss: true });
      return;
    }
    if (y < 2000 || y > currentCalendarYear + 5) {
      addToast(`Année hors plage (2000–${currentCalendarYear + 5})`, { appearance: "warning", autoDismiss: true });
      return;
    }
    if (Data.FiscalYears && Data.FiscalYears.some((f) => f.year === y)) {
      addToast(`L'année ${y} existe déjà`, { appearance: "warning", autoDismiss: true });
      return;
    }
    if (y > currentCalendarYear + 1) {
      if (!window.confirm(`Vous créez une année lointaine ${y} (au-delà de ${currentCalendarYear + 1}). Continuer ?`)) return;
    }
    setLoading(true);
    let resp = await postReq("accounting/fiscal-years/", { year: y });
    if (resp) {
      addToast(`Année fiscale ${y} créée`, { appearance: "success", autoDismiss: true });
      fetchYears();
      setNewYear("");
      setCreateYearOpen(false);
    } else {
      addToast("Erreur de création (année duplicata ?)", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const confirmClose = (fy) => {
    setCloseTarget(fy);
    setCreateNext(true);
    setCloseAck(false);
    setCloseConfirmText("");
  };
  const closeCanConfirm =
    !!closeTarget &&
    closeAck &&
    closeConfirmText.trim() === String(closeTarget.year) &&
    !loading;
  const handleClose = async () => {
    if (!closeTarget) return;
    if (!closeCanConfirm) return;
    // Final native guard — user explicitly asked for double confirmation
    const label = `Clôturer définitivement l'année ${closeTarget.year} ?\n\n` +
      `${closeTarget.invoice_count ?? 0} facture(s), ${closeTarget.snapshot_count ?? 0} produit(s) en stock.\n` +
      (createNext ? `L'année ${closeTarget.year + 1} sera créée avec report de stock.` : `Aucune année suivante ne sera créée.`) +
      `\n\nCette action est irréversible sans Rouvrir (audit).`;
    if (!window.confirm(label)) return;
    setLoading(true);
    const r = await postWithError(`accounting/fiscal-years/${closeTarget.id}/close/`, { create_next_year: createNext });
    if (r.ok) {
      addToast(r.data.message || "Année clôturée", { appearance: "success", autoDismiss: true });
      fetchYears();
      setCloseTarget(null);
      setCloseAck(false);
      setCloseConfirmText("");
      // if next year created, select it? update Data
      if (r.data.next_year) {
        let obj = { ...Data };
        // fetch will refresh, but also set selected
        obj.SelectedFiscalYear = r.data.next_year;
        setData(obj);
      }
    } else {
      addToast(r.data.error || "Erreur de clôture", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const confirmUnlock = (fy) => {
    setUnlockTarget(fy);
    setUnlockReason("");
  };
  const handleUnlock = async () => {
    if (!unlockTarget) return;
    setLoading(true);
    const r = await postWithError(`accounting/fiscal-years/${unlockTarget.id}/unlock/`, { reason: unlockReason });
    if (r.ok) {
      addToast(r.data.message || "Année rouverte", { appearance: "success", autoDismiss: true });
      fetchYears();
      setUnlockTarget(null);
    } else {
      addToast(r.data.error || "Erreur déverrouillage", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const confirmDelete = (fy) => {
    setDeleteTarget(fy);
    setDeleteForce(false);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    const suffix = deleteForce ? "?force=true" : "";
    const r = await deleteWithError(`accounting/fiscal-years/${deleteTarget.id}/${suffix}`);
    if (r.ok) {
      addToast(r.data.message || "Année supprimée", { appearance: "success", autoDismiss: true });
      fetchYears();
      setDeleteTarget(null);
      // if deleted was selected year, clear selection
      if (Data.SelectedFiscalYear && Data.SelectedFiscalYear.id === deleteTarget.id) {
        let obj = { ...Data };
        obj.SelectedFiscalYear = null;
        setData(obj);
      }
    } else {
      addToast(r.data.error || "Suppression refusée", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const years = Data.FiscalYears || [];
  const openYears = years.filter((y) => !y.is_locked);
  const lockedYears = years.filter((y) => y.is_locked);
  const hasSprawl = years.some((y) => y.year >= 2030);

  const html = (
    <Fragment>
      <AnimateNav />

      {/* ── Create Year Modal ── */}
      <Modal open={createYearOpen} closeFunction={setCreateYearOpen}>
        <h2 style={{ color: "var(--second)" }}>Nouvelle Année Fiscale</h2>
        <div className="form" style={{ marginTop: "20px" }}>
          <div style={{ margin: "10px 0" }}>
            <label>Année (ex: {currentCalendarYear})</label>
            <input
              type="number"
              className="field"
              style={{ width: "100%", marginTop: "5px" }}
              placeholder="Saisissez l'année..."
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
            {newYear && parseInt(newYear, 10) > currentCalendarYear + 1 && (
              <div style={{ color: "orange", fontSize: "0.75rem", marginTop: "6px" }}>
                <FontAwesomeIcon icon={faExclamationTriangle} /> Année lointaine – évitez de créer 2030+ prématurément. L’année est créée à la clôture automatiquement.
              </div>
            )}
            {Data.FiscalYears && Data.FiscalYears.some((f) => f.year === parseInt(newYear, 10)) && (
              <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: "6px" }}>Cette année existe déjà</div>
            )}
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

      {/* ── Close Modal — explicit what-will-happen + confirmation ── */}
      <Modal open={!!closeTarget} closeFunction={() => setCloseTarget(null)}>
        {closeTarget && (
          <>
            <h2 style={{ color: "var(--red)" }}><FontAwesomeIcon icon={faLock} /> Clôturer l’année {closeTarget.year} ?</h2>
            <div style={{ marginTop: "16px", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)" }}>
              <div style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.25)", padding: "12px 14px", borderRadius: "8px", color: "#ff8080" }}>
                <strong>Action irréversible (audit).</strong> L’année deviendra <strong>lecture seule</strong>. Pour corriger après, il faudra la <strong>Rouvrir</strong> (loggé).
              </div>

              <div style={{ marginTop: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px", borderRadius: "8px" }}>
                <div style={{ fontWeight: 700, marginBottom: "8px" }}>Ce qui va se passer :</div>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>🔒 <strong>{closeTarget.year}</strong> sera <strong>verrouillée</strong> ({closeTarget.invoice_count ?? 0} facture(s), {closeTarget.snapshot_count ?? 0} produit(s) en stock).</li>
                  <li>⛔ Impossible de créer/modifier/supprimer des <strong>factures, paiements, stock</strong> sur {closeTarget.year} (seule la référence d’impression reste modifiable).</li>
                  <li>{createNext ? <>📦 L’année <strong>{closeTarget.year + 1}</strong> sera <strong>créée (ou réutilisée)</strong> et le <strong>stock actuel sera reporté</strong> comme stock initial.</> : <>📦 <strong>Aucune année suivante</strong> ne sera créée. Vous devrez la créer manuellement plus tard.</>}</li>
                  <li>⚠️ Si vous clôturez chaque année sans besoin, vous allez vite atteindre <strong>2030+</strong>. Ne clôturez que l’exercice <strong>réellement terminé</strong>.</li>
                </ul>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", background: "rgba(255,255,255,0.04)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <input type="checkbox" checked={createNext} onChange={(e) => setCreateNext(e.target.checked)} />
                <span>Créer l’année <strong>{closeTarget.year + 1}</strong> et reporter le stock ? (recommandé)</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "12px", background: "rgba(255,165,0,0.07)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,165,0,0.25)" }}>
                <input type="checkbox" checked={closeAck} onChange={(e) => setCloseAck(e.target.checked)} style={{ marginTop: "4px" }} />
                <span>Je comprends que <strong>{closeTarget.year} sera verrouillée</strong> et que les factures/paiements/stock seront bloqués (audit).</span>
              </label>

              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Pour confirmer, tapez l’année <strong>{closeTarget.year}</strong> :</label>
                <input
                  type="text"
                  className="field"
                  style={{ width: "100%", marginTop: "6px", fontFamily: "monospace" }}
                  placeholder={String(closeTarget.year)}
                  value={closeConfirmText}
                  onChange={(e) => setCloseConfirmText(e.target.value)}
                />
                {closeConfirmText && closeConfirmText.trim() !== String(closeTarget.year) && (
                  <div style={{ color: "orange", fontSize: "0.75rem", marginTop: "6px" }}>Tapez exactement {closeTarget.year} pour activer le bouton.</div>
                )}
              </div>
            </div>
            <div className="filtre-row" style={{ marginTop: "20px", justifyContent: "flex-end" }}>
              <button
                className="btn-main"
                style={{ borderColor: "var(--red)", color: "var(--red)", opacity: closeCanConfirm ? 1 : 0.5 }}
                onClick={handleClose}
                disabled={!closeCanConfirm}
                title={!closeCanConfirm ? "Cochez la case et tapez l'année pour confirmer" : "Clôturer définitivement"}
              >
                {loading ? "..." : `Clôturer ${closeTarget.year} définitivement`}
              </button>
              <button className="btn-main" onClick={() => setCloseTarget(null)}>Annuler</button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Unlock Modal ── */}
      <Modal open={!!unlockTarget} closeFunction={() => setUnlockTarget(null)}>
        {unlockTarget && (
          <>
            <h2 style={{ color: "#00C9A7" }}><FontAwesomeIcon icon={faLockOpen} /> Rouvrir {unlockTarget.year} ?</h2>
            <div style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
              <p>La réouverture permet des corrections mais doit rester exceptionnelle (audit).</p>
              <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Année clôturée le {unlockTarget.closed_at ? new Date(unlockTarget.closed_at).toLocaleString() : "—"} – {unlockTarget.invoice_count ?? "?"} factures.</p>
              <label style={{ display: "block", marginTop: "14px", fontSize: "0.8rem", opacity: 0.8 }}>Motif (log d’audit, optionnel)</label>
              <input
                type="text"
                className="field"
                style={{ width: "100%", marginTop: "6px" }}
                placeholder="Ex: correction stock janvier"
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
              />
            </div>
            <div className="filtre-row" style={{ marginTop: "20px", justifyContent: "flex-end" }}>
              <button className="btn-main" style={{ borderColor: "#00C9A7", color: "#00C9A7" }} onClick={handleUnlock} disabled={loading}>
                {loading ? "..." : "Rouvrir"}
              </button>
              <button className="btn-main" onClick={() => setUnlockTarget(null)}>Annuler</button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal open={!!deleteTarget} closeFunction={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <>
            <h2 style={{ color: "var(--red)" }}><FontAwesomeIcon icon={faTrashAlt} /> Supprimer FY-{deleteTarget.year} ?</h2>
            <div style={{ marginTop: "16px", fontSize: "0.9rem", lineHeight: 1.6 }}>
              {deleteTarget.invoice_count > 0 ? (
                <div style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", padding: "12px", borderRadius: "8px", color: "var(--red)" }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Cette année contient <strong>{deleteTarget.invoice_count} facture(s)</strong> et {deleteTarget.snapshot_count ?? "?"} snapshots. Suppression = <strong>suppression en cascade</strong> des factures ! Audit déconseillé.
                </div>
              ) : (
                <div style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)", padding: "12px", borderRadius: "8px" }}>
                  Année vide (0 facture) – suppression sans risque. {deleteTarget.is_locked ? "Année clôturée mais vide → peut être supprimée." : ""}
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", color: deleteTarget.invoice_count > 0 ? "var(--red)" : "inherit" }}>
                <input type="checkbox" checked={deleteForce} onChange={(e) => setDeleteForce(e.target.checked)} disabled={deleteTarget.invoice_count === 0 ? false : false} />
                <span>Forcer la suppression même avec factures (coche requise si &gt;0)</span>
              </label>
              {deleteTarget.year > currentCalendarYear && deleteTarget.invoice_count === 0 && (
                <div style={{ fontSize: "0.75rem", marginTop: "8px", color: "orange" }}>Année future vide – recommandé à supprimer si créée par erreur (2030+).</div>
              )}
            </div>
            <div className="filtre-row" style={{ marginTop: "20px", justifyContent: "flex-end" }}>
              <button
                className="btn-main"
                style={{ borderColor: "var(--red)", color: "var(--red)", opacity: deleteTarget.invoice_count > 0 && !deleteForce ? 0.5 : 1 }}
                onClick={handleDelete}
                disabled={loading || (deleteTarget.invoice_count > 0 && !deleteForce)}
              >
                {loading ? "..." : "Supprimer définitivement"}
              </button>
              <button className="btn-main" onClick={() => setDeleteTarget(null)}>Annuler</button>
            </div>
          </>
        )}
      </Modal>

      <div className="pannel-container">
        {/* Banners */}
        {hasSprawl && (
          <WarningBanner>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: "2px" }} />
            <div>
              <strong>Attention : vous avez atteint {Math.max(...years.map((y)=>y.year))}.</strong> Chaque clôture crée l’année suivante. Évitez de clôturer prématurément – ne clôturez que l’exercice réellement terminé. Les années futures vides (2030+) peuvent être <strong>supprimées</strong> si créées par erreur.
            </div>
          </WarningBanner>
        )}
        <InfoBanner>
          <FontAwesomeIcon icon={faInfoCircle} style={{ marginTop: "2px" }} />
          <div>
            <strong>UX conseillée :</strong> 1 année ouverte à la fois. <strong>Ouvertes : {openYears.length}</strong> – <strong>Clôturées : {lockedYears.length}</strong> – Factures totales : {years.reduce((s,y)=>s+(y.invoice_count||0),0)}. Sélectionnez l’année active sur le Dashboard.
          </div>
        </InfoBanner>

        <div className="row">
          <Card width="95%" height="auto" minHeight="420px">
            <div className="title-select-row">
              <h3 className="card-title text-center inline" style={{ color: "#0077B6", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <FontAwesomeIcon icon={faCalendar} /> Années Fiscales
                <span style={{ fontSize: "0.6em", color: "var(--text)", opacity: 0.6 }}>({years.length} exercices)</span>
              </h3>
              <div className="inline" style={{ display: "flex", gap: "8px" }}>
                <button className="btn-main" onClick={() => setCreateYearOpen(true)} disabled={loading}>
                  <FontAwesomeIcon icon={faPlus} /> Créer l'année
                </button>
              </div>
            </div>

            <div id="table-wrapper">
              <table id="status-table">
                <thead>
                  <tr>
                    <th>Année</th>
                    <th>Statut</th>
                    <th>Factures</th>
                    <th>Stock</th>
                    <th>Ouverte le</th>
                    <th>Clôturée le</th>
                    <th style={{ minWidth: "260px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {years.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: "center", opacity: 0.5, padding: "30px" }}><FontAwesomeIcon icon={faSearch} /> Aucune année</td></tr>
                  )}
                  {years
                    .slice()
                    .sort((a,b)=>b.year-a.year)
                    .map((year) => {
                    const isOpen = !year.is_locked;
                    const isFutureEmpty = year.year > currentCalendarYear + 1 && (year.invoice_count === 0);
                    const isFuture = year.year > currentCalendarYear;
                    return (
                      <tr key={year.id} style={isFutureEmpty ? { background: "rgba(255,165,0,0.04)" } : {}}>
                        <td style={{ fontWeight: "700", color: isFuture ? "orange" : "#fff", fontSize: "1.05em" }}>
                          {year.year} {isFutureEmpty && <span style={{ fontSize: "0.65em", background: "orange", color: "black", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" }}>future vide</span>}
                        </td>
                        <td>
                          <Badge className={isOpen ? "open" : "locked"}>{isOpen ? "Ouverte" : "Clôturée"}</Badge>
                          {year.invoice_count === 0 && <Badge className="empty" style={{ marginLeft: "6px" }}>vide</Badge>}
                        </td>
                        <td style={{ fontWeight: "600", color: year.invoice_count > 0 ? "white" : "var(--grey)" }}>{year.invoice_count ?? 0}</td>
                        <td style={{ color: "var(--grey)" }}>{year.snapshot_count ?? 0}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--grey)" }}>{year.opened_at ? new Date(year.opened_at).toLocaleDateString() : "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: year.closed_at ? "var(--red)" : "var(--grey)" }}>{year.closed_at ? new Date(year.closed_at).toLocaleDateString() : "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                            {isOpen ? (
                              <button
                                className="btn-main"
                                style={{ color: "var(--red)", borderColor: "var(--red)", padding: "6px 10px", fontSize: "0.75rem" }}
                                onClick={() => confirmClose(year)}
                                disabled={loading}
                                title="Clôturer (audit)"
                              >
                                <FontAwesomeIcon icon={faLock} /> Clôturer
                              </button>
                            ) : (
                              <button
                                className="btn-main"
                                style={{ color: "#00C9A7", borderColor: "#00C9A7", padding: "6px 10px", fontSize: "0.75rem" }}
                                onClick={() => confirmUnlock(year)}
                                disabled={loading}
                                title="Rouvrir pour correction"
                              >
                                <FontAwesomeIcon icon={faLockOpen} /> Rouvrir
                              </button>
                            )}
                            <button
                              className="btn-main"
                              style={{ color: "var(--red)", borderColor: "var(--red)", padding: "6px 10px", fontSize: "0.75rem", opacity: (year.invoice_count>0?0.7:1) }}
                              onClick={() => confirmDelete(year)}
                              disabled={loading}
                              title={year.invoice_count>0 ? "Suppression cascade (dangereux)" : "Supprimer année vide"}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "14px", fontSize: "0.75rem", color: "var(--grey)", textAlign: "center", opacity: 0.7 }}>
              Conseil : ne gardez qu’une seule année <strong>Ouverte</strong>. Les années futures vides (ex: 2030 sans factures) peuvent être supprimées. La réouverture est loggée dans <em>notes</em>.
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
