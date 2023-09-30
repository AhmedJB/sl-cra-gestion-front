import React, { useState, useEffect, useContext,createRef, Fragment} from "react";
import { UserContext } from "../contexts/UserContext";
import {Link} from "react-router-dom";
import { useRef } from "react";
import { motion, useCycle } from "framer-motion";
import { useDimensions } from "./use-dimensions";
import { MenuToggle } from "./MenuToggle";
import { Navigation } from "./Navigation";
import styled from 'styled-components';
import {logout} from '../helper';

import { useDetectClickOutside } from 'react-detect-click-outside';



function AnimateNav(props){
    const [User, setUser] = useContext(UserContext);
    
    
    

    const sidebar = {
        open: (h = 1000) => ({
          clipPath: `circle(110vh at 40px 40px)`,
          height: h[1],
          transition: {
            type: "spring",
            stiffness: 20,
            restDelta: 2
          },
         
          
        }),
        closed: {
          clipPath: "circle(30px at 40px 40px)",
          transition: {
            delay: 0.5,
            type: "spring",
            stiffness: 400,
            damping: 40
          },
          
        }
      };

    const navbar = {
      open :(h = 1000) => ({
        clipPath: `circle(110vh at 40px 40px)`,
        zIndex:10,
        width:300,
        transition:{
          clipPath: {
            type: "spring",
            stiffness: 50,
            restDelta: 2
          }
        }
      }),
      closed : {
        clipPath: "circle(30px at 40px 40px)",
        zIndex:1,
        transition : {
          clipPath:{
            type: "spring",
            stiffness: 50,
            restDelta: 2
          },
          zIndex:{
            delay:1
          },
          width :{
            delay:1.2
          }
        },
        width:300
      }
    }

    const layer = {
      open : {
        opacity:1,
        transition:{
          opacity:{
            delay:0
          }
        },

        zIndex:9
      },
      closed : {
        opacity:0,
        
        zIndex:-1,
        transition : {
          opacity:{
            delay:0.8
          },
          zIndex:{
            delay:1
          }
          
        }
      }
    }

    function handleClick(){
      if (isOpen){
        toggleOpen();
      }
      
    }

      const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const nav = createRef(null);
  //const {h} = isOpen ? useDimensions(nav) : "100vh";
  const t = isOpen ? (() => {let t = document.querySelector('body');
  console.log('test')
  
    t.style.overflowY = "hidden";
    console.log(t.style.overflowY);
})(): (() => {let t = document.querySelector('body');
console.log(t);
console.log('test2')
t.style.overflowY = "auto";
})();
  const reff = useDetectClickOutside({ onTriggered: handleClick});
  
  return (

    <Fragment>
      <motion.div
    id="layer"
    initial={false}
    animate={isOpen ? "open" : "closed"}
    /* className={isOpen ? "open" : "closed"} */
    
    variants={layer}
    onClick={handleClick}
    
      >

      </motion.div>
<motion.nav
      id="sidebar"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className={isOpen ? "overflow":""}
      custom={height}
      variants={navbar}
      
      ref={containerRef}
      
    >
        
      {/* <motion.div className="background"  variants={sidebar}  /> */}
      {isOpen ?  <Navigation  /> : ""}
     
      <MenuToggle toggle={() => toggleOpen()} />

    </motion.nav>
    </Fragment>
    
  );

    /* return (
        <Fragment>
        <input type="checkbox" id="toggle" />
  <label className="fa fa-bars" htmlFor="toggle" />
  

    <nav id="side">
  <a className="brand">
    Gestion
    <label className="fa fa-times" htmlFor="toggle" />
  </a>
  <ul>
    <li> <Link  to='/app/pannel'><i className="fa fa-chart-bar" /><a> Dashboard </a></Link></li>
    <li> <Link to='/app/vente'><i className="fa fa-shopping-cart" /><a> Vente </a></Link></li>
    
    <li onClick={logout}><i className="fas fa-sign-out-alt" /><a> déconnecter </a></li>
  </ul>
  <div className="share">
    <i className="fa fa-instagram" />
    <i className="fa fa-facebook" />
    <i className="fa fa-twitter" />
    <i className="fa fa-linkedin" />
  </div>
</nav>
</Fragment>
    ) */



}



export default AnimateNav;