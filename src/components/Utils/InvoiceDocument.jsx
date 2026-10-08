import React from "react";
import Logo1 from "../../static/pics/LOGO-1.png";
import Logo2 from "../../static/pics/logo.svg";
import { round } from "../../helper";

// Company identity — BAIRH RADIATEUR (from client paper invoice)
const COMPANY = {
    name: "BAIRH RADIATEUR",
    tagline: "CALM DOWN YOUR ENGINE",
    legal: "S.A.R.L. au capital de 50 000,00 Dh",
    address: "10 Lot Baraka Wiam Bensouda Mag 3 - Fès",
    gsm: "06 61 08 56 62",
    email: "najate.radiateur@yahoo.fr",
    tp: "13439808",
    if: "15163065",
    rc: "43697",
    cnss: "9961659",
    ice: "000010730000029",
};

const fmt = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + " DH";
};

const fmtNum = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const fmtDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

const fmtDateSlashes = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// ─── French number to words (for "somme en lettres", dirhams) ───
const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function underHundred(n) {
    if (n < 20) return UNITS[n];
    const t = Math.floor(n / 10);
    const r = n % 10;
    if (t === 7 || t === 9) {
        // 70-79, 90-99 build on 60/80 + teens
        const base = TENS[t];
        const teen = 10 + r;
        if (t === 7 && r === 1) return base + "-et-onze";
        return base + "-" + UNITS[teen];
    }
    if (r === 0) {
        if (t === 8) return "quatre-vingts";
        return TENS[t];
    }
    if (r === 1 && t !== 8) return TENS[t] + "-et-un";
    return TENS[t] + "-" + UNITS[r];
}

function underThousand(n) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    let out = "";
    if (h > 0) {
        if (h === 1) out = "cent";
        else out = UNITS[h] + " cent" + (r === 0 ? "s" : "");
        if (r > 0) out += " ";
    }
    if (r > 0) out += underHundred(r);
    return out;
}

function numberToFrenchWords(n) {
    n = Math.round(Number(n || 0));
    if (n === 0) return "zéro";
    if (n < 0) return "moins " + numberToFrenchWords(-n);
    const parts = [];
    const millions = Math.floor(n / 1000000);
    const thousands = Math.floor((n % 1000000) / 1000);
    const rest = n % 1000;
    if (millions > 0) {
        parts.push((millions === 1 ? "un million" : underThousand(millions) + " millions"));
    }
    if (thousands > 0) {
        if (thousands === 1) parts.push("mille");
        else parts.push(underThousand(thousands) + " mille");
    }
    if (rest > 0) parts.push(underThousand(rest));
    return parts.join(" ");
}

// TTC helpers — new compta rows carry unit_price_ttc; legacy rows derive x1.2
const itemRef = (it) => it.reference || it.ref || "";
const itemName = (it) => it.product_name || it.name || "Produit";
const itemQty = (it) => Number(it.quantity || 0);
const itemPuTtc = (it) => {
    if (it.unit_price_ttc || it.prix_ttc || it.prixTTC) return Number(it.unit_price_ttc || it.prix_ttc || it.prixTTC || 0);
    if (it.effective_unit_ttc) return Number(it.effective_unit_ttc || 0);
    return round(Number(it.prix || it.unit_price || 0) * 1.2);
};
const itemRemise = (it) => {
    const d = Number(it.discount || 0);
    if (isNaN(d)) return 0;
    return Math.max(0, Math.min(100, d));
};
const itemTotalTtc = (it) => {
    if (it.effective_total_ttc) return Number(it.effective_total_ttc || 0);
    return round(itemQty(it) * itemPuTtc(it) * (1 - itemRemise(it) / 100));
};

const InvoiceDocument = ({ type, order, details, client, templateId, variant, bairhKind, docLabel }) => {
    const isBairh = variant === "bairh";
    if (isBairh) {
        return <BairhInvoice order={order} details={details} client={client} templateId={templateId} kind={bairhKind} docLabel={docLabel} />;
    }

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
    const isBon = type === "bon";
    const showPrices = !isBonSansPrix && !isPurchaseOrder;
    const showTva = !isBonSansPrix && !isPurchaseOrder && !isBon;

    const clientLabel = type === "bon_commande_fournisseur" ? "FOURNISSEUR :" : isBon ? "CLIENT :" : "FACTURÉ À :";

    const docNumLabel = (() => {
        switch (type) {
            case "devis": return "DEVIS N°:";
            case "bon": case "bon_sans_prix": return "BL N°:";
            case "bon_commande": return "BC N°:";
            case "avoir": return "AVOIR N°:";
            default: return "FACTURE N°:";
        }
    })();

    const ROWS_PER_PAGE = 14;
    const rawDetails = details || [];
    let normalizedData = (rawDetails.length > 0 && rawDetails[0].client)
        ? rawDetails
        : [{ client: client || order?.client, details: rawDetails }];
    if (normalizedData.length === 1 && normalizedData[0].details.length > ROWS_PER_PAGE) {
        const flat = normalizedData[0].details;
        const cli = normalizedData[0].client;
        normalizedData = [];
        for (let i = 0; i < flat.length; i += ROWS_PER_PAGE) {
            normalizedData.push({ client: cli, details: flat.slice(i, i + ROWS_PER_PAGE) });
        }
    }

    const grandOrderTotal = normalizedData.reduce((sum, g) => {
        const ls = Array.isArray(g.details) ? g.details : [];
        return sum + ls.reduce((s, it) => s + Number(it.prix || 0) * Number(it.quantity || 0), 0);
    }, 0);
    const grandTaxTotal = round(grandOrderTotal * 0.2);
    const grandGrandTotal = round(grandOrderTotal + grandTaxTotal);
    const isLastPage = (idx) => idx === normalizedData.length - 1;

    return (
        <div id={templateId} className="invoice-container-root">
            {normalizedData.map((group, pageIdx) => {
                const lines = Array.isArray(group.details) ? group.details : [];

                return (
                    <div
                        className="page facture-reference"
                        key={`${type}-${pageIdx}`}
                        style={{ pageBreakAfter: pageIdx < normalizedData.length - 1 ? "always" : "auto" }}
                    >
                        <img id="watermark" src={Logo2} alt="" />

                        <div className="invoice-sheet">
                            {!isBon && (
                                <div className="inv-header-centered">
                                    <img src={Logo1} alt="Bairh Radiateur" className="inv-logo" />
                                    <div className="inv-company-details">
                                        <p className="inv-company-name-top">{COMPANY.name}</p>
                                        <p>{COMPANY.tagline}</p>
                                        <p>{COMPANY.legal}</p>
                                        <p>{COMPANY.address}</p>
                                    </div>
                                </div>
                            )}

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
                                        {showTva && <th>TVA</th>}
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
                                                {showTva && <td>20%</td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {showPrices && isLastPage(pageIdx) && (
                                <div className="inv-totals-block">
                                    {isBon ? (
                                        <div className="inv-total-final-bar">
                                            <span>TOTAL</span>
                                            <span>{fmt(grandOrderTotal)}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="inv-total-row">
                                                <span className="inv-total-label">SOUS-TOTAL HT</span>
                                                <span className="inv-total-value">{fmt(grandOrderTotal)}</span>
                                            </div>
                                            <div className="inv-total-row">
                                                <span className="inv-total-label">TVA TOTAL (20%)</span>
                                                <span className="inv-total-value">{fmt(grandTaxTotal)}</span>
                                            </div>
                                            <div className="inv-total-final-bar">
                                                <span>TOTAL</span>
                                                <span>{fmt(grandGrandTotal)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {normalizedData.length > 1 && (
                                <div className="inv-pagination">
                                    Page {pageIdx + 1} / {normalizedData.length}
                                </div>
                            )}

                            {!isBon && (
                                <footer className="inv-footer">
                                    <p className="inv-footer-company">{COMPANY.name} - {COMPANY.legal}</p>
                                    <p>RC : {COMPANY.rc} | ICE : {COMPANY.ice} | IF : {COMPANY.if} | TP : {COMPANY.tp} | CNSS : {COMPANY.cnss}</p>
                                    <p>Tél : {COMPANY.gsm} | Email : {COMPANY.email}</p>
                                </footer>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Bairh comptabilité invoice — layout inspired by supplier paper invoice ───
// Référence | Désignation | Qté | Prix U. TTC | Total TTC, HT/TVA/TTC, somme en lettres.
const BairhInvoice = ({ order, details, client, templateId, kind, docLabel }) => {
    const isPurchase = kind === "ACHAT";
    const codeLabel = isPurchase ? "Code Fourn. :" : "Code Client :";
    const numLabel = docLabel || (kind === "AVOIR" ? "Avoir N° :" : "Facture N° :");
    const ROWS_PER_PAGE = 14;
    const rawDetails = details || [];
    let normalizedData = (rawDetails.length > 0 && rawDetails[0].client)
        ? rawDetails
        : [{ client: client || order?.client, details: rawDetails }];
    if (normalizedData.length === 1 && normalizedData[0].details.length > ROWS_PER_PAGE) {
        const flat = normalizedData[0].details;
        const cli = normalizedData[0].client;
        normalizedData = [];
        for (let i = 0; i < flat.length; i += ROWS_PER_PAGE) {
            normalizedData.push({ client: cli, details: flat.slice(i, i + ROWS_PER_PAGE) });
        }
    }

    const grandTtc = normalizedData.reduce((sum, g) => {
        const ls = Array.isArray(g.details) ? g.details : [];
        return sum + ls.reduce((s, it) => s + itemTotalTtc(it), 0);
    }, 0);
    const grandHt = round(grandTtc / 1.2);
    const grandTva = round(grandTtc - grandHt);
    const words = numberToFrenchWords(grandTtc).toUpperCase() + " DHS";
    const isLastPage = (idx) => idx === normalizedData.length - 1;

    return (
        <div id={templateId} className="invoice-container-root">
            {normalizedData.map((group, pageIdx) => {
                const lines = Array.isArray(group.details) ? group.details : [];
                const cli = group.client || {};
                const codeClient = cli?.id
                    ? `${isPurchase ? "F" : "C"}-${String(cli.id).padStart(4, "0")}`
                    : "—";

                return (
                    <div
                        className="page facture-reference"
                        key={`bairh-${pageIdx}`}
                        style={{ pageBreakAfter: pageIdx < normalizedData.length - 1 ? "always" : "auto" }}
                    >
                        <div className="invoice-sheet bairh-sheet">
                            <div className="bairh-title">
                                <h1>{COMPANY.name} <span className="bairh-title-suffix">S.A.R.L.</span></h1>
                                <p className="bairh-subtitle">DISTRIBUTION PIÈCES RADIATEUR — {COMPANY.tagline}</p>
                            </div>

                            <div className="bairh-client-box">
                                <p className="bairh-client-name">{cli?.name || "Client"}</p>
                                {cli?.address && <p>{cli.address}</p>}
                                {cli?.phone && <p>Tél: {cli.phone}</p>}
                                <p>ICE <span className="bairh-ice">{cli?.ice || "—"}</span></p>
                            </div>

                            <div className="bairh-meta-bar">
                                <div className="bairh-meta-cell">
                                    <span className="bairh-meta-label">{numLabel}</span>
                                    <span className="bairh-meta-value">{order?.invoice_id || order?.o_id || "-"}</span>
                                </div>
                                <div className="bairh-meta-cell">
                                    <span className="bairh-meta-label">{codeLabel}</span>
                                    <span className="bairh-meta-value">{codeClient}</span>
                                </div>
                                <div className="bairh-meta-cell">
                                    <span className="bairh-meta-label">Date :</span>
                                    <span className="bairh-meta-value">{fmtDateSlashes(order?.date)}</span>
                                </div>
                            </div>

                            <table className="bairh-table">
                                <thead>
                                    <tr>
                                        <th className="bairh-th-ref">Référence</th>
                                        <th className="bairh-th-des">Désignation</th>
                                        <th>Qté</th>
                                        <th>Prix U. TTC</th>
                                        <th>R. (%)</th>
                                        <th>Total TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="bairh-td-ref">{itemRef(item) || "—"}</td>
                                            <td className="bairh-td-des">{itemName(item)}</td>
                                            <td>{itemQty(item)}</td>
                                            <td>{fmtNum(itemPuTtc(item))}</td>
                                            <td>{itemRemise(item) ? itemRemise(item).toFixed(2) : "—"}</td>
                                            <td className="bairh-td-total">{fmtNum(itemTotalTtc(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {isLastPage(pageIdx) && (
                                <>
                                    <table className="bairh-totals">
                                        <tbody>
                                            <tr>
                                                <td className="bairh-tot-label">Total H.T.</td>
                                                <td className="bairh-tot-val">{fmtNum(grandHt)}</td>
                                                <td className="bairh-tot-label">T.V.A 20,00 %</td>
                                                <td className="bairh-tot-val">{fmtNum(grandTva)}</td>
                                                <td className="bairh-tot-label">Total T.T.C</td>
                                                <td className="bairh-grand">{fmtNum(grandTtc)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="bairh-words">
                                        <p>La présente facture s'élève à la somme de :</p>
                                        <p className="bairh-words-amount">{words}</p>
                                    </div>

                                    <p className="bairh-note">Note: Reconnaît avoir reçu conforme à la livraison ci-dessus</p>
                                </>
                            )}

                            {normalizedData.length > 1 && (
                                <div className="inv-pagination">
                                    Page {pageIdx + 1} / {normalizedData.length}
                                </div>
                            )}

                            <footer className="bairh-footer">
                                <p className="bairh-footer-addr">{COMPANY.address} - Fès/ GSM: {COMPANY.gsm}</p>
                                <p>Email: {COMPANY.email}</p>
                                <p>TP: {COMPANY.tp} IF: {COMPANY.if} RC: {COMPANY.rc} CNSS: {COMPANY.cnss} ICE: {COMPANY.ice}</p>
                            </footer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InvoiceDocument;
