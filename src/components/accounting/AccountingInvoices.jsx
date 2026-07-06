import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../../contexts/UserContext";
import { DataContext } from "../../contexts/DataContext";
import { Redirect } from "react-router-dom";
import AnimateNav from "../AnimateNav";
import styled from "styled-components";
import { req, postReq } from "../../helper";
import Modal from "../Modal";
import CustomSelect from "../CustomSelect";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashAlt,
  faMoneyBillWave,
  faEye,
  faDownload,
  faTimes,
  faCheck,
  faFileInvoice,
  faShoppingCart,
  faHandHoldingUsd,
} from "@fortawesome/free-solid-svg-icons";
import { Preview } from "react-html2pdf";
import { downloadInvoicePDF } from "../../utils/pdfGenerator";
import InvoiceDocument from "../Utils/InvoiceDocument";
import "../../static/frontend/invoice.css";

// ─── Styled Components ────────────────────────────────────────────────────────

const Card = styled.div`
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

// Modal Styles
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalTitle = styled.h2`
  color: var(--second);
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrapper {
    background: rgba(0, 180, 216, 0.1);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ModalSubtitle = styled.p`
  color: var(--text);
  font-size: 0.85rem;
  margin: 8px 0 0 48px;
  opacity: 0.7;
`;



const SectionTitle = styled.h4`
  color: var(--second);
  font-size: 0.95rem;
  margin: 0 0 16px 0;
  padding-left: 12px;
  border-left: 3px solid var(--second);
  display: flex;
  align-items: center;
  gap: 8px;
`;



const ItemsContainer = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr 80px 120px 40px;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px;
  }
`;

const OrDivider = styled.span`
  color: var(--text);
  font-size: 0.75rem;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--red);
  font-size: 1rem;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
  }
`;

const AddItemButton = styled.button`
  width: 100%;
  padding: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 12px;

  &:hover {
    border-color: var(--second);
    color: var(--second);
    background: rgba(0, 180, 216, 0.05);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const Button = styled.button`
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid;
  margin: 0;
  white-space: nowrap;

  &.primary {
    background: var(--second);
    border-color: var(--second);
    color: white;

    &:hover {
      background: var(--second-hover);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  &.secondary {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.15);
    color: var(--text);

    &:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &.danger {
    background: transparent;
    border-color: var(--red);
    color: var(--red);

    &:hover {
      background: rgba(255, 0, 0, 0.1);
    }
  }
`;

// Details Modal Styles
const DetailsHeader = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailsColumn = styled.div``;

const DetailItem = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 1rem;
    color: white;
  }

  &.amount .value {
    font-size: 1.2rem;
    font-weight: 600;
  }

  &.due .value {
    color: var(--red);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.paid {
    background: rgba(0, 201, 167, 0.15);
    color: var(--green);
  }
  &.partial {
    background: rgba(255, 165, 0, 0.15);
    color: orange;
  }
  &.unpaid {
    background: rgba(255, 0, 0, 0.15);
    color: var(--red);
  }
`;

const DataTable = styled.div`
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  table {
    width: 100%;
    font-size: 0.85rem;
    border-collapse: collapse;

    thead {
      position: sticky;
      top: 0;
      background: #1a1a1a;
      z-index: 1;

      th {
        padding: 12px 16px;
        text-align: left;
        font-weight: 500;
        color: var(--text);
        opacity: 0.7;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;

        &:not(:first-child) {
          text-align: center;
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        td {
          padding: 12px 16px;
          color: var(--text);

          &:not(:first-child) {
            text-align: center;
          }
        }
      }
    }
  }
`;

const PaymentHistorySection = styled.div`
  background: rgba(0, 201, 167, 0.03);
  border: 1px solid rgba(0, 201, 167, 0.1);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
`;

// Payment Modal Styles
const PaymentInfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;

  .info-icon {
    background: rgba(255, 0, 0, 0.1);
    color: var(--red);
    padding: 12px;
    border-radius: 8px;
    font-size: 1.2rem;
  }

  .info-content {
    flex: 1;

    .invoice-ref {
      color: white;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .amount-due {
      color: var(--red);
      font-size: 0.85rem;
      margin-top: 4px;
    }
  }
`;

const PaymentFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// No selection warning
const WarningBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: var(--red);
`;

// Item number badge
const ItemNumber = styled.span`
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 180, 216, 0.2);
  color: var(--second);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemRowWrapper = styled.div`
  position: relative;
  padding-left: 20px;
`;



const Input = styled.input`
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
  color: white;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: var(--second);
  }
`;

const SelectWrapper = styled.div`
  .react-select__control {
    height: 44px;
    min-height: 44px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: none;
  }
`;

const FormSection = styled.div`
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.7;
    text-transform: uppercase;
  }

  &.full {
    grid-column: 1 / -1;
  }
`;

// ─── ITEMS UI ─────────────────────────────────

const ItemCard = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 12px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.8rem;
  opacity: 0.6;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

function AccountingInvoices(props) {
  const [User] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const { addToast } = useToasts();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Invoice creation modal
  const [createOpen, setCreateOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState("ACHAT");
  const [partner, setPartner] = useState(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product_name: "", product_id: null, quantity: 1, unit_price: 0 },
  ]);

  const [snapshotProducts, setSnapshotProducts] = useState([]);

  // Payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("CASH");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Details Modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsInvoice, setDetailsInvoice] = useState(null);

  // PDF Generation
  const [pdfInvoice, setPdfInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const selectedYear = Data.SelectedFiscalYear;

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchInvoices = async () => {
    if (!selectedYear) return;
    const resp = await req(`accounting/invoices/?year=${selectedYear.year}`);
    if (resp) setInvoices(resp);
  };

  const openDetailsModal = async (inv) => {
    setLoading(true);
    const resp = await req(`accounting/invoices/${inv.id}/`);
    if (resp) {
      setDetailsInvoice(resp);
      setDetailsOpen(true);
    } else {
      addToast("Erreur de chargement", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const handlePreview = async (inv) => {
    setLoading(true);
    const resp = await req(`accounting/invoices/${inv.id}/`);
    if (resp) {
      setPreviewInvoice(resp);
    } else {
      addToast("Erreur lors de la récupération des données", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  const handleActualDownload = () => {
    if (previewInvoice) {
      setPdfInvoice(previewInvoice);
      setPreviewInvoice(null);
    }
  };

  const handleDownload = async (inv) => {
    await handlePreview(inv);
  };

  useEffect(() => {
    if (pdfInvoice) {
      const timer = setTimeout(() => {
        downloadInvoicePDF("accounting-pdf-template", pdfInvoice.invoice_number || `Facture-${pdfInvoice.id}`);
        setPdfInvoice(null);
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfInvoice]);

  const fetchSnapshotProducts = async () => {
    if (!selectedYear) return;
    const resp = await req(`accounting/snapshots/?year=${selectedYear.year}`);
    if (resp) {
      setSnapshotProducts(
        resp.map((s) => ({
          id: s.product,
          name: s.product_name || `Produit #${s.product}`,
        }))
      );
    }
  };

  const fetchPartners = async () => {
    if (!Data.Suppliers || Data.Suppliers.length === 0) {
      const [supResp, cliResp] = await Promise.all([
        req("provider/"),
        req("client/"),
      ]);
      const updates = {};
      if (supResp) updates.Suppliers = supResp;
      if (cliResp) updates.Clients = cliResp;
      if (Object.keys(updates).length > 0) {
        setData((prev) => ({ ...prev, ...updates }));
      }
    }
  };

  useEffect(() => {
    if (User?.logged && User?.is_accounting_user) {
      fetchInvoices();
      fetchPartners();
      fetchSnapshotProducts();
    }
  }, [User?.logged, User?.is_accounting_user, selectedYear]);

  // ─── Invoice Creation ────────────────────────────────────────────────────

  const handleAddItem = () => {
    setItems([...items, { product_name: "", product_id: null, quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      addToast("Au moins un article est requis", { appearance: "warning", autoDismiss: true });
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleItemProductSelect = (index, vs) => {
    const updated = [...items];
    if (vs.length > 0) {
      updated[index].product_id = vs[0].id;
      updated[index].product_name = vs[0].name;
    } else {
      updated[index].product_id = null;
    }
    setItems(updated);
  };

  const getItemsTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseInt(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  };

  const resetCreateForm = () => {
    setNotes("");
    setPartner(null);
    setInvoiceType("ACHAT");
    setPaymentMode("CASH");
    setItems([{ product_name: "", product_id: null, quantity: 1, unit_price: 0 }]);
  };

  const handleCreateSubmit = async () => {
    if (!selectedYear) {
      addToast("Veuillez d'abord sélectionner une année fiscale sur le Dashboard", {
        appearance: "warning",
        autoDismiss: true,
      });
      return;
    }

    const hasEmptyProduct = items.some((item) => !item.product_id && !item.product_name);
    if (!partner || hasEmptyProduct) {
      addToast("Veuillez remplir tous les champs obligatoires", {
        appearance: "warning",
        autoDismiss: true,
      });
      return;
    }

    const payload = {
      fiscal_year_id: selectedYear.id,
      invoice_type: invoiceType,
      provider_id: invoiceType === "ACHAT" ? partner : null,
      client_id: invoiceType === "VENTE" ? partner : null,
      payment_mode: paymentMode,
      notes: notes,
      items: items.map((item) => ({
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        ...(item.product_id ? { product_id: item.product_id } : { product_name: item.product_name }),
      })),
    };

    setLoading(true);
    const resp = await postReq("accounting/invoices/", payload);
    if (resp) {
      addToast("Facture créée avec succès", { appearance: "success", autoDismiss: true });
      fetchInvoices();
      setCreateOpen(false);
      resetCreateForm();
    } else {
      addToast("Erreur de création", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  // ─── Payment Handling ────────────────────────────────────────────────────

  const openPayModal = (invoice) => {
    setPayInvoice(invoice);
    setPayAmount("");
    setPayRef("");
    setPayNotes("");
    setPayMode("CASH");
    setPayOpen(true);
  };

  const handlePaySubmit = async () => {
    if (!payInvoice || !payAmount || parseFloat(payAmount) <= 0) {
      addToast("Montant valide requis", { appearance: "warning", autoDismiss: true });
      return;
    }

    const amountDue = parseFloat(payInvoice.amount_due || payInvoice.balance_due || 0);
    if (parseFloat(payAmount) > amountDue) {
      addToast(`Le montant ne peut pas dépasser ${amountDue} DH`, {
        appearance: "warning",
        autoDismiss: true,
      });
      return;
    }

    setLoading(true);
    const resp = await postReq("accounting/payments/", {
      invoice_id: payInvoice.id,
      amount: parseFloat(payAmount),
      payment_mode: payMode,
      reference: payRef,
      notes: payNotes,
    });
    if (resp) {
      addToast("Paiement enregistré avec succès", { appearance: "success", autoDismiss: true });
      setPayOpen(false);
      fetchInvoices();
    } else {
      addToast("Erreur de paiement", { appearance: "error", autoDismiss: true });
    }
    setLoading(false);
  };

  // ─── Constants ───────────────────────────────────────────────────────────

  const invoiceTypes = [
    { value: "ACHAT", name: "Achat" },
    { value: "VENTE", name: "Vente" },
  ];

  const paymentModes = [
    { value: "CASH", name: "Espèces" },
    { value: "CHECK", name: "Chèque" },
    { value: "TRANSFER", name: "Virement" },
    { value: "CARD", name: "Carte" },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "PAID": return "paid";
      case "PARTIAL": return "partial";
      default: return "unpaid";
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!User?.logged || !User?.is_accounting_user) {
    return (
      <Redirect
        to={{ pathname: "/appfront/app/pannel", state: { error: true, msg: "Accès refusé" } }}
      />
    );
  }

  return (
    <Fragment>
      <AnimateNav />

      {/* ═══ CREATE INVOICE MODAL ═══ */}
      <Modal open={createOpen} closeFunction={() => { setCreateOpen(false); resetCreateForm(); }}>
        <ModalHeader>
          <ModalTitle>Nouvelle Facture</ModalTitle>
        </ModalHeader>

        {/* GENERAL INFO */}
        <FormSection>
          <SectionTitle>Informations Générales</SectionTitle>

          <FormGrid>
            <FormField>
              <label>Type</label>
              <SelectWrapper>
                <CustomSelect
                  options={invoiceTypes}
                  changeFunc={(vs) => {
                    if (vs.length > 0) setInvoiceType(vs[0].value);
                    setPartner(null);
                  }}
                  label="name"
                  multi={false}
                  values={invoiceTypes.filter((t) => t.value === invoiceType)}
                  fvalue="value"
                />
              </SelectWrapper>
            </FormField>

            <FormField>
              <label>{invoiceType === "ACHAT" ? "Fournisseur" : "Client"}</label>
              <SelectWrapper>
                <CustomSelect
                  options={invoiceType === "ACHAT" ? Data.Suppliers || [] : Data.Clients || []}
                  changeFunc={(vs) => setPartner(vs.length > 0 ? vs[0].id : null)}
                  label="name"
                  multi={false}
                  values={(invoiceType === "ACHAT" ? Data.Suppliers : Data.Clients)?.filter(p => p.id === partner)}
                  fvalue="id"
                />
              </SelectWrapper>
            </FormField>

            <FormField>
              <label>Paiement</label>
              <SelectWrapper>
                <CustomSelect
                  options={paymentModes}
                  changeFunc={(vs) => setPaymentMode(vs.length > 0 ? vs[0].value : "CASH")}
                  label="name"
                  multi={false}
                  values={paymentModes.filter((m) => m.value === paymentMode)}
                  fvalue="value"
                />
              </SelectWrapper>
            </FormField>

            <FormField className="full">
              <label>Notes</label>
              <Input
                placeholder="Notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* ITEMS */}
        <FormSection>
          <SectionTitle>
            Articles ({items.length})
            <span style={{ marginLeft: "auto" }}>
              {getItemsTotal().toFixed(2)} DH
            </span>
          </SectionTitle>

          {items.map((item, index) => (
            <ItemCard key={index}>
              <ItemHeader>
                <span>Article #{index + 1}</span>
                <DeleteButton onClick={() => handleRemoveItem(index)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </DeleteButton>
              </ItemHeader>

              <ItemGrid>
                <FormField>
                  <label>Produit</label>
                  <SelectWrapper>
                    <CustomSelect
                      options={snapshotProducts}
                      changeFunc={(vs) => handleItemProductSelect(index, vs)}
                      label="name"
                      multi={false}
                      values={snapshotProducts.filter((p) => p.id === item.product_id)}
                      fvalue="id"
                      placeholder="Sélectionner..."
                      disableMargin={true}
                    />
                  </SelectWrapper>
                </FormField>

                <FormField>
                  <label>Quantité</label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  />
                </FormField>

                <FormField>
                  <label>Prix Unitaire (DH)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 100.00"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                  />
                </FormField>
              </ItemGrid>
            </ItemCard>
          ))}

          <AddItemButton onClick={handleAddItem}>
            <FontAwesomeIcon icon={faPlus} />
            Ajouter un article
          </AddItemButton>
        </FormSection>

        <ModalFooter>
          <Button className="danger" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
            Annuler
          </Button>

          <Button className="primary" onClick={handleCreateSubmit} disabled={loading}>
            Créer la Facture
          </Button>
        </ModalFooter>
      </Modal>


      {/* ═══ PAYMENT MODAL ═══ */}
      <Modal open={payOpen} closeFunction={setPayOpen}>
        <ModalHeader>
          <ModalTitle>
            <span className="icon-wrapper" style={{ background: "rgba(0, 201, 167, 0.1)" }}>
              <FontAwesomeIcon icon={faHandHoldingUsd} />
            </span>
            Enregistrer un Paiement
          </ModalTitle>
        </ModalHeader>

        {payInvoice && (
          <PaymentInfoBox>
            <div className="info-icon">
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
            <div className="info-content">
              <div className="invoice-ref">
                Facture : {payInvoice.number || payInvoice.id}
              </div>
              <div className="amount-due">
                Reste dû : {payInvoice.amount_due || payInvoice.balance_due} DH
              </div>
            </div>
          </PaymentInfoBox>
        )}

        <FormSection>
          <PaymentFormGrid>
            <FormField>
              <label>Montant (DH)</label>
              <input
                type="number"
                className="field"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </FormField>
            <FormField>
              <label>Mode de Paiement</label>
              <CustomSelect
                options={paymentModes}
                changeFunc={(vs) => setPayMode(vs.length > 0 ? vs[0].value : "CASH")}
                label="name"
                multi={false}
                values={paymentModes.filter((m) => m.value === payMode)}
                fvalue="value"
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField>
              <label>Référence</label>
              <input
                type="text"
                className="field"
                placeholder="Ex: CHQ-123 (optionnel)"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </FormField>
            <FormField>
              <label>Notes</label>
              <input
                type="text"
                className="field"
                placeholder="Notes (optionnel)"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
              />
            </FormField>
          </PaymentFormGrid>
        </FormSection>

        <ModalFooter>
          <Button className="danger" onClick={() => setPayOpen(false)}>
            <FontAwesomeIcon icon={faTimes} />
            Annuler
          </Button>
          <Button className="primary" onClick={handlePaySubmit} disabled={loading}>
            <FontAwesomeIcon icon={faCheck} />
            Confirmer le Paiement
          </Button>
        </ModalFooter>
      </Modal>

      {/* ═══ DETAILS MODAL ═══ */}
      <Modal open={detailsOpen} closeFunction={setDetailsOpen}>
        {detailsInvoice ? (
          <>
            <ModalHeader>
              <div>
                <ModalTitle>
                  <span className="icon-wrapper">
                    <FontAwesomeIcon icon={faEye} />
                  </span>
                  Détails de la Facture
                </ModalTitle>
                <ModalSubtitle>
                  N° {detailsInvoice.invoice_number || detailsInvoice.id} —{" "}
                  {new Date(detailsInvoice.created_at).toLocaleDateString()}
                </ModalSubtitle>
              </div>
            </ModalHeader>

            <DetailsHeader>
              <DetailsGrid>
                <DetailsColumn>
                  <DetailItem>
                    <div className="label">Type</div>
                    <div className="value">
                      {detailsInvoice.invoice_type === "ACHAT" ? "Achat" : "Vente"}
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">
                      {detailsInvoice.invoice_type === "ACHAT" ? "Fournisseur" : "Client"}
                    </div>
                    <div className="value">
                      {detailsInvoice.invoice_type === "ACHAT"
                        ? detailsInvoice.provider_detail?.name || "Fournisseur"
                        : detailsInvoice.client_detail?.name || "Client"}
                    </div>
                  </DetailItem>
                </DetailsColumn>
                <DetailsColumn>
                  <DetailItem>
                    <div className="label">Statut</div>
                    <div className="value">
                      <StatusBadge className={getStatusClass(detailsInvoice.status)}>
                        {detailsInvoice.status === "PAID" ? "Payée" :
                          detailsInvoice.status === "PARTIAL" ? "Partielle" : "Non payée"}
                      </StatusBadge>
                    </div>
                  </DetailItem>
                  <DetailItem className="amount">
                    <div className="label">Total</div>
                    <div className="value">
                      {(detailsInvoice.total || 0).toFixed(2)} DH
                    </div>
                  </DetailItem>
                  <DetailItem className="due">
                    <div className="label">Reste dû</div>
                    <div className="value">
                      {(detailsInvoice.balance_due || 0).toFixed(2)} DH
                    </div>
                  </DetailItem>
                </DetailsColumn>
              </DetailsGrid>
            </DetailsHeader>

            <SectionTitle>
              <FontAwesomeIcon icon={faShoppingCart} size="sm" />
              Articles ({detailsInvoice.items?.length || 0})
            </SectionTitle>
            <DataTable>
              <table>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsInvoice.items?.length > 0 ? (
                    detailsInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>{(item.unit_price || 0).toFixed(2)} DH</td>
                        <td style={{ fontWeight: "500" }}>{(item.total || 0).toFixed(2)} DH</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", opacity: 0.5 }}>
                        Aucun article trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DataTable>

            {detailsInvoice.payments?.length > 0 && (
              <PaymentHistorySection>
                <SectionTitle style={{ color: "var(--green)", marginBottom: "12px" }}>
                  <FontAwesomeIcon icon={faHandHoldingUsd} size="sm" />
                  Historique des Paiements
                </SectionTitle>
                <DataTable style={{ border: "none", marginBottom: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Mode</th>
                        <th>Référence</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsInvoice.payments.map((pay) => (
                        <tr key={pay.id}>
                          <td>{new Date(pay.paid_at).toLocaleDateString()}</td>
                          <td>{pay.payment_mode}</td>
                          <td>{pay.reference || "—"}</td>
                          <td style={{ color: "var(--green)", fontWeight: "500" }}>
                            {(pay.amount || 0).toFixed(2)} DH
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTable>
              </PaymentHistorySection>
            )}

            <ModalFooter>
              <Button className="secondary" onClick={() => setDetailsOpen(false)}>
                Fermer
              </Button>
            </ModalFooter>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--purple)" }}>
            <FontAwesomeIcon icon={faFileInvoice} spin size="2x" />
            <p style={{ marginTop: "16px" }}>Chargement des détails...</p>
          </div>
        )}
      </Modal>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="pannel-container">
        {!selectedYear && (
          <div className="row">
            <Card width="90%" height="auto">
              <WarningBox>
                <FontAwesomeIcon icon={faFileInvoice} size="lg" />
                Veuillez d'abord sélectionner une année fiscale sur le{" "}
                <strong>Tableau de Bord Comptable</strong>
              </WarningBox>
            </Card>
          </div>
        )}

        <div className="row">
          <Card width="90%" height="auto" minHeight="500px">
            <div className="title-select-row">
              <h3 className="card-title text-center inline" style={{ color: "#00B4D8" }}>
                <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: "10px" }} />
                Factures
                {selectedYear && (
                  <span style={{ fontSize: "0.65em", color: "var(--text)", marginLeft: "10px" }}>
                    ({selectedYear.year})
                  </span>
                )}
              </h3>
              <div className="inline">
                <Button className="primary" onClick={() => setCreateOpen(true)} disabled={!selectedYear}>
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvelle Facture
                </Button>
              </div>
            </div>

            <div id="table-wrapper">
              <table id="status-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Partenaire</th>
                    <th>Total (DH)</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.number || inv.id}</td>
                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td>{inv.invoice_type}</td>
                        <td>{inv.invoice_type === "ACHAT" ? inv.provider_name : inv.client_name}</td>
                        <td style={{ fontWeight: "500" }}>
                          {(inv.total || inv.total_amount || 0).toFixed(2)}
                        </td>
                        <td>
                          <StatusBadge className={getStatusClass(inv.status)}>
                            {inv.status === "PAID" ? "Payée" :
                              inv.status === "PARTIAL" ? "Partielle" : "Non payée"}
                          </StatusBadge>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <Button
                              className="secondary"
                              style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                              onClick={() => openDetailsModal(inv)}
                              title="Voir les détails"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button
                              className="secondary"
                              style={{ padding: "8px 10px", fontSize: "0.85rem", color: "var(--purple)", borderColor: "var(--purple)" }}
                              onClick={() => handleDownload(inv)}
                              title="Télécharger PDF"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </Button>
                            {inv.status !== "PAID" && (
                              <Button
                                className="secondary"
                                style={{ padding: "8px 10px", fontSize: "0.85rem", color: "var(--green)", borderColor: "var(--green)" }}
                                onClick={() => openPayModal(inv)}
                                title="Enregistrer un paiement"
                              >
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ opacity: 0.5, padding: "40px" }}>
                        <FontAwesomeIcon icon={faFileInvoice} size="2x" style={{ marginBottom: "12px", display: "block" }} />
                        Aucune facture trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ═══ INVOICE PREVIEW MODAL ═══ */}
      <Modal open={!!previewInvoice} closeFunction={() => setPreviewInvoice(null)}>
        <div className="preview-modal-container">
          <div className="preview-header">
            <h3>Aperçu de la Facture</h3>
            <div className="preview-actions">
              <button className="btn-preview-cancel" onClick={() => setPreviewInvoice(null)}>
                Annuler
              </button>
              <button
                className="btn-preview-download"
                onClick={handleActualDownload}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faDownload} />
                {loading ? "Génération..." : "Télécharger PDF"}
              </button>
            </div>
          </div>
          <div className="preview-body">
            {previewInvoice && (
              <InvoiceDocument
                type={previewInvoice.invoice_type === "ACHAT" ? "facture" : "facture"}
                templateId="invoice-preview"
                order={{
                  o_id: previewInvoice.invoice_number || previewInvoice.id,
                  invoice_id: previewInvoice.invoice_number || previewInvoice.id,
                  date: previewInvoice.created_at,
                  total: previewInvoice.total || 0,
                  client: previewInvoice.client_detail || null,
                }}
                details={
                  previewInvoice.items?.map((item) => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    prix: item.unit_price,
                  })) || []
                }
                client={
                  previewInvoice.invoice_type === "ACHAT"
                    ? previewInvoice.provider_detail
                    : previewInvoice.client_detail
                }
              />
            )}
          </div>
        </div>
      </Modal>

      {/* ═══ PDF TEMPLATE (Hidden, used for actual generation) ═══ */}
      {pdfInvoice && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <Preview id="accounting-pdf-template">
            <InvoiceDocument
              type={pdfInvoice.invoice_type === "ACHAT" ? "facture" : "facture"}
              templateId="accounting-pdf-template"
              order={{
                o_id: pdfInvoice.invoice_number || pdfInvoice.id,
                invoice_id: pdfInvoice.invoice_number || pdfInvoice.id,
                date: pdfInvoice.created_at,
                total: pdfInvoice.total || 0,
                client: pdfInvoice.client_detail || null,
              }}
              details={
                pdfInvoice.items?.map((item) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  prix: item.unit_price,
                })) || []
              }
              client={
                pdfInvoice.invoice_type === "ACHAT"
                  ? pdfInvoice.provider_detail
                  : pdfInvoice.client_detail
              }
            />
          </Preview>
        </div>
      )}
    </Fragment>
  );
}

export default AccountingInvoices;