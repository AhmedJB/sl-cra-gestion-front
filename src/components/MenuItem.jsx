import React, { useState, useEffect, useContext, Fragment } from "react";
import { motion } from "framer-motion";
import { UserContext } from "../contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faCoffee,
  faFileInvoice,
  faHistory,
  faPeopleCarry,
  faSignOutAlt,
  faTachometerAlt,
  faUsers,
  faChartPie,
  faFileInvoiceDollar,
  faMoneyCheckAlt,
  faCalendarAlt,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const colors = [
  "#FF008C",
  "#e65eef",
  "#D309E1",
  "#9C1AFF",
  "#7700FF",
  "#6029f5",
  "#4400FF",
  "#00C9A7",
  "#00B4D8",
  "#0096C7",
  "#0077B6",
  "#00D4AA",
];
const icons = [
  <FontAwesomeIcon icon={faTachometerAlt} />,
  <FontAwesomeIcon icon={faPeopleCarry} />,
  <FontAwesomeIcon icon={faUsers} />,
  <FontAwesomeIcon icon={faBoxes} />,
  <FontAwesomeIcon icon={faFileInvoice} />,
  <FontAwesomeIcon icon={faHistory}></FontAwesomeIcon>,
  <FontAwesomeIcon icon={faSignOutAlt} />,
  <FontAwesomeIcon icon={faChartPie} />,
  <FontAwesomeIcon icon={faFileInvoiceDollar} />,
  <FontAwesomeIcon icon={faCalendarAlt} />,
  <FontAwesomeIcon icon={faWarehouse} />,
];
const text = [
  "Dashboard",
  "Fournisseurs",
  "Clients",
  "Stock",
  "Echeance",
  "Historique",
  "Deconnexion",
  "Tableau de Bord",
  "Factures",
  "Années Fiscales",
  "Stock Comptable",
];
const links = [
  "/appfront/app/pannel",
  "/appfront/app/supplier",
  "/appfront/app/client",
  "/appfront/app/supply",
  "/appfront/app/echeance",
  "/appfront/app/historyv",
  "",
  "/appfront/app/accounting",
  "/appfront/app/accounting/invoices",
  "/appfront/app/accounting/fiscal-years",
  "/appfront/app/accounting/stock",
];

export const MenuItem = ({ i }) => {
  const [User, setUser] = useContext(UserContext);
  function logout() {
    let obj = { ...User };
    obj.logged = false;
    obj.username = null;
    obj.email = null;
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setUser(obj);
  }

  const style = { border: `2px solid ${colors[i]}`, color: `${colors[i]}` };
  const style2 = {
    border: `2px solid ${colors[i]}`,
    padding: "10px",
    color: `${colors[i]}`,
  };
  const ic = icons[i];
  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={text[i] == "Deconnexion" ? logout : () => {}}
    >
      <Link to={links[i]}>
        <div className="icon-placeholder" style={style}>
          {" "}
          {ic}{" "}
        </div>

        <div className="text-placeholder" style={style2}>
          {text[i]}{" "}
        </div>
      </Link>
    </motion.li>
  );
};
