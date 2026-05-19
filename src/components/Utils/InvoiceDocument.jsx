import React from "react";
import Logo1 from "../../static/pics/LOGO-1.png";
import Logo2 from "../../static/pics/logo.svg";
import { round } from "../../helper";

const fmt = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + " DH";
};

const fmtDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

const InvoiceDocument = ({ type, order, details, client, templateId }) => {
    const getTitle = () => {
        switch (type) {
            case "facture": return "FACTURE";
            case "bon": return "BON DE LIVRAISON";
            case "bon_sans_prix": return "BON DE LIVRAISON";
            case "bon_commande": return "BON DE COMMANDE";
            case "avoir": return "FACTURE D'AVOIR";
            case "devis": return "DEVIS PRO-FORMA";
            default: return "DOCUMENT";
        }
    };

    const isBonSansPrix = type === "bon_sans_prix";
    const isPurchaseOrder = type === "bon_commande";
    const showPrices = !isBonSansPrix && !isPurchaseOrder;

    const clientLabel = type === "bon_commande_fournisseur" ? "FOURNISSEUR :" : "FACTURÉ À :";

    const docNumLabel = (() => {
        switch (type) {
            case "devis": return "DEVIS N°:";
            case "bon": case "bon_sans_prix": return "BL N°:";
            case "bon_commande": return "BC N°:";
            case "avoir": return "AVOIR N°:";
            default: return "FACTURE N°:";
        }
    })();

    const rawDetails = details || [];
    const normalizedData = (rawDetails.length > 0 && rawDetails[0].client)
        ? rawDetails
        : [{ client: client || order?.client, details: rawDetails }];

    return (
        <div id={templateId} className="invoice-container-root">
            {normalizedData.map((group, pageIdx) => {
                const lines = Array.isArray(group.details) ? group.details : [];
                const subTotal = lines.reduce((s, item) => s + Number(item.prix || 0) * Number(item.quantity || 0), 0);
                const orderTotal = Number(order?.total ?? subTotal);
                const taxTotal = round(orderTotal * 0.2);
                const grandTotal = round(orderTotal + taxTotal);

                return (
                    <div
                        className="page facture-reference"
                        key={`${type}-${pageIdx}`}
                        style={{ pageBreakAfter: pageIdx < normalizedData.length - 1 ? "always" : "auto" }}
                    >
                        <img id="watermark" src={Logo2} alt="" />

                        <div className="invoice-sheet">
                            <div className="inv-header-centered">
                                <img src={Logo1} alt="Najate Radiateur" className="inv-logo" />
                                <div className="inv-company-details">
                                    <p className="inv-company-name-top">Najate Radiateur</p>
                                    <p>S.A.R.L. au capital de 50 000,00 Dh</p>
                                    <p>10 Lot Baraka Wiam Bensouda Mag 3 - Fès</p>
                                </div>
                            </div>

                            <div className="inv-title-bar">
                                <h1>{getTitle()}</h1>
                            </div>

                            <div className="inv-info-grid">
                                <div className="inv-info-left">
                                    <p className="inv-label-bold">{clientLabel}</p>
                                    <p className="inv-client-name">{group.client?.name || "Client"}</p>
                                    {group.client?.ice && <p className="inv-info-text">ICE: {group.client.ice}</p>}
                                    {group.client?.address && <p className="inv-info-text">Adresse: {group.client.address}</p>}
                                    {group.client?.phone && <p className="inv-info-text">Tél: {group.client.phone}</p>}
                                </div>

                                <div className="inv-info-right">
                                    <div className="inv-meta-row">
                                        <span className="inv-meta-label">{docNumLabel}</span>
                                        <span className="inv-meta-value">{order?.invoice_id || order?.o_id || "-"}</span>
                                    </div>
                                    <div className="inv-meta-row">
                                        <span className="inv-meta-label">DATE:</span>
                                        <span className="inv-meta-value">{fmtDate(order?.date)}</span>
                                    </div>
                                </div>
                            </div>

                            <table className="inv-table">
                                <thead>
                                    <tr>
                                        <th className="inv-th-desc">DESCRIPTION</th>
                                        {showPrices && <th>PU HT</th>}
                                        <th>QTE</th>
                                        {showPrices && <th>MT HT</th>}
                                        {showPrices && <th>TVA</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((item, idx) => {
                                        const qty = Number(item.quantity || 0);
                                        const pu = Number(item.prix || 0);
                                        const mt = round(qty * pu);
                                        return (
                                            <tr key={idx}>
                                                <td className="inv-td-desc">{item.product_name || item.name || "Produit"}</td>
                                                {showPrices && <td>{fmt(pu).replace(" DH", "")}</td>}
                                                <td>{qty}</td>
                                                {showPrices && <td>{fmt(mt)}</td>}
                                                {showPrices && <td>20%</td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {showPrices && (
                                <div className="inv-totals-block">
                                    <div className="inv-total-row">
                                        <span className="inv-total-label">SOUS-TOTAL HT</span>
                                        <span className="inv-total-value">{fmt(orderTotal)}</span>
                                    </div>
                                    <div className="inv-total-row">
                                        <span className="inv-total-label">TVA TOTAL (20%)</span>
                                        <span className="inv-total-value">{fmt(taxTotal)}</span>
                                    </div>
                                    <div className="inv-total-final-bar">
                                        <span>TOTAL</span>
                                        <span>{fmt(grandTotal)}</span>
                                    </div>
                                </div>
                            )}

                            <footer className="inv-footer">
                                <p className="inv-footer-company">Najate Radiateur - S.A.R.L. au capital de 50 000,00 Dh</p>
                                <p>RC : 43697 | ICE : 000010730000029 | IF : 15163065 | TP : 13439808 | CNSS : 9961659</p>
                                <p>Tél : 06 61 08 56 62 | Email : najate.radiateur@yahoo.fr</p>
                            </footer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InvoiceDocument;
