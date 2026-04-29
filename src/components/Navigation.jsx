import * as React from "react";
import { useContext } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "./MenuItem";
import { BrandItem } from "./BrandItem";
import { UserContext } from "../contexts/UserContext";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

// Standard inventory items
const inventoryIds = [0, 1, 2, 3, 4, 5];
// Accounting-only items
const accountingIds = [7, 8, 9, 10];

export const Navigation = (props) => {
  const ref = React.useRef(null);
  const [User, setUser] = useContext(UserContext);

  const isAccountingUser = User && User.is_accounting_user;

  return (
    <motion.ul id="content-nav-container" ref={ref} variants={variants}>
      <BrandItem />
      
      {/* Accounting users: ONLY accounting items */}
      {isAccountingUser ? (
        <React.Fragment>
          {accountingIds.map((i) => (
            <MenuItem i={i} key={i} />
          ))}
        </React.Fragment>
      ) : (
        /* Non-accounting users: ONLY inventory items */
        <React.Fragment>
          {inventoryIds.map((i) => (
            <MenuItem i={i} key={i} />
          ))}
        </React.Fragment>
      )}

      {/* Logout — always last */}
      <MenuItem i={6} key={6} />
    </motion.ul>
  );
};
