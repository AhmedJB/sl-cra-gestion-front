import React, { useState, useEffect, useContext , Fragment} from "react";
import { motion } from "framer-motion";
import { UserContext } from "../contexts/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faCoffee, faFileInvoice, faHistory, faPeopleCarry, faSignOutAlt, faTachometerAlt, faUsers } from '@fortawesome/free-solid-svg-icons'
import {Link} from "react-router-dom";

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

const colors = ["#FF008C","#e65eef", "#D309E1", "#9C1AFF", "#7700FF","#6029f5","#4400FF"];
const icons = [<FontAwesomeIcon icon={faTachometerAlt} />,<FontAwesomeIcon icon={faPeopleCarry} />,<FontAwesomeIcon icon={faUsers} /> ,<FontAwesomeIcon icon={faBoxes} />,<FontAwesomeIcon icon={faFileInvoice} />,<FontAwesomeIcon icon={faHistory}></FontAwesomeIcon> ,<FontAwesomeIcon icon={faSignOutAlt} />]
const text = ["Dashboard","Fournisseurs","Clients","Stock","Echeance","Historique","Deconnexion"]
const links = ['/app/pannel','/app/supplier','/app/client','/app/supply','/app/echeance','/app/historyv']


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
  const style2 = { border: `2px solid ${colors[i]}`, padding:'10px' , color: `${colors[i]}`}
  const ic = icons[i];
  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={text[i] == 'Deconnexion' ? logout : "" }
    ><Link  to={links[i]}>
      <div className="icon-placeholder" style={style} > {ic}  </div>

      <div className="text-placeholder" style={style2}>{text[i]}  </div>
      </Link>
    </motion.li>
  );
};
