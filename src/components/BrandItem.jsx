import * as React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faCoffee, faFileInvoice, faPeopleCarry, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components';

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


const Brand = styled.h1`
  color:var(--second);
  
  font-weight:600;
  font-style:italic;
  text-align:center;
  text-transfrom: uppercase;
  letter-spacing:8px;
  font-size:1.7em;
  width:100%;
  margin:20px 0px;
  `;


export const BrandItem =  (props) => {
  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <img className='logo' src='/static/pics/logo.svg' alt='logo'></img>
    </motion.li>
  );
};
