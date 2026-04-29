import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import { req, postReq } from "../../helper";
import Modal from "../Modal";
import CustomSelect from "../CustomSelect";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Card = styled.div`
  background: #000000;
  background: -webkit-linear-gradient(bottom right, #000000, #282828);
  background: -moz-linear-gradient(bottom right, #000000, #282828);
  background: linear-gradient(to top left, #000000, #282828);
  padding: 30px 20px;
  margin: 50px 15px 0px 15px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.644),
    0px 0px 25px rgba(0, 0, 0, 0.719);
  width: ${(props) => props.width};
  max-width: ${(props) => (props.maxWidth ? props.maxWidth : "90%")};
  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
`;

function AccountingPayments(props) {
  const [User, setUser] = useContext(UserContext);
  const { addToast } = useToasts();

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const fetchPayments = async () => {
    let resp = await req("accounting/payments");
    if (resp) {
      setPayments(resp);
    }
  };

  const fetchInvoices = async () => {
    let resp = await req("accounting/invoices");
    if (resp) {
      // Filter out fully paid invoices for the dropdown
      const unpaid = resp.filter((i) => i.status !== "PAID");
      const formatted = unpaid.map((i) => ({
        id: i.id,
        name: `${i.number || i.id} — ${
          i.invoice_type === "ACHAT" ? i.provider_name : i.client_name
        } (Reste: ${i.amount_due} DH)`,
      }));
      setInvoices(formatted);
    }
  };

  useEffect(() => {
    if (User.logged && User.is_accounting_user) {
      fetchPayments();
      fetchInvoices();
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedInvoice || !amount) {
      addToast("Veuillez remplir les champs obligatoires", {
        appearance: "warning",
        autoDismiss: true,
      });
      return;
    }

    const payload = {
      invoice_id: selectedInvoice,
      amount: parseFloat(amount),
      payment_mode: paymentMode,
      reference: reference,
      notes: notes,
    };

    setLoading(true);
    let resp = await postReq("accounting/payments", payload);
    if (resp) {
      addToast("Paiement enregistré", {
        appearance: "success",
        autoDismiss: true,
      });
      fetchPayments();
      fetchInvoices();
      setModalOpen(false);
      setAmount("");
      setReference("");
      setNotes("");
      setSelectedInvoice(null);
    } else {
      addToast("Erreur lors de l'enregistrement", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoading(false);
  };

  const paymentModes = [
    { value: "CASH", name: "Espèces" },
    { value: "CHECK", name: "Chèque" },
    { value: "TRANSFER", name: "Virement" },
    { value: "CARD", name: "Carte" },
  ];

  const html = (
    <Fragment>
      <AnimateNav />

      {/* ── Payment Modal ── */}
      <Modal open={modalOpen} closeFunction={setModalOpen}>
        <h2 style={{ color: "var(--second)" }}>Nouveau Paiement</h2>
        <div className="form">
          <div
            className="filtre-row"
            style={{ justifyContent: "flex-start" }}
          >
            <div style={{ width: "400px", margin: "10px" }}>
              <label>Facture</label>
              <CustomSelect
                options={invoices}
                changeFunc={(vs) =>
                  setSelectedInvoice(vs.length > 0 ? vs[0].id : null)
                }
                label="name"
                multi={false}
                values={invoices.filter((i) => i.id === selectedInvoice)}
                fvalue="id"
                placeholder="Sélectionner une facture..."
              />
            </div>
            <div style={{ width: "200px", margin: "10px" }}>
              <label>Mode de Paiement</label>
              <CustomSelect
                options={paymentModes}
                changeFunc={(vs) =>
                  setPaymentMode(vs.length > 0 ? vs[0].value : "CASH")
                }
                label="name"
                multi={false}
                values={paymentModes.filter(
                  (m) => m.value === paymentMode
                )}
                fvalue="value"
                placeholder="Paiement"
              />
            </div>
          </div>

          <div
            className="filtre-row"
            style={{ justifyContent: "flex-start" }}
          >
            <div style={{ margin: "10px" }}>
              <label>Montant (DH)</label>
              <input
                type="number"
                className="field"
                style={{ width: "200px", marginTop: "5px" }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div style={{ margin: "10px" }}>
              <label>Référence</label>
              <input
                type="text"
                className="field"
                style={{ width: "200px", marginTop: "5px" }}
                placeholder="Ex: CHQ-123"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div style={{ margin: "10px" }}>
            <label>Notes</label>
            <input
              type="text"
              className="field"
              style={{ width: "90%", marginTop: "5px" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div
            className="filtre-row"
            style={{ marginTop: "20px", justifyContent: "flex-end" }}
          >
            <button
              className="btn-main"
              onClick={handleSubmit}
              disabled={loading}
            >
              Valider
            </button>
            <button
              className="btn-main"
              style={{ borderColor: "var(--red)", color: "var(--red)" }}
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Payments Table ── */}
      <div className="pannel-container">
        <div className="row">
          <Card width="90%" height="auto" minHeight="500px">
            <div className="title-select-row">
              <h3
                className="card-title text-center inline"
                style={{ color: "#0096C7" }}
              >
                Paiements
              </h3>
              <div className="inline">
                <button
                  className="btn-main"
                  onClick={() => setModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Ajouter Paiement
                </button>
              </div>
            </div>

            <div id="table-wrapper">
              <table id="status-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Facture Liée</th>
                    <th>Montant (DH)</th>
                    <th>Mode</th>
                    <th>Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {payments && payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{new Date(p.date).toLocaleDateString()}</td>
                        <td>
                          {p.invoice_number ||
                            `Facture #${p.invoice_id || p.invoice}`}
                        </td>
                        <td
                          style={{
                            color: "var(--green)",
                            fontWeight: "bold",
                          }}
                        >
                          {p.amount}
                        </td>
                        <td>{p.payment_mode}</td>
                        <td>{p.reference}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucun paiement trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Fragment>
  );

  return User.logged && User.is_accounting_user ? (
    html
  ) : (
    <Redirect
      to={{
        pathname: "/appfront/app/pannel",
        state: { error: true, msg: "Accès refusé" },
      }}
    />
  );
}

export default AccountingPayments;
