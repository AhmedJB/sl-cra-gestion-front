import * as React from "react";
import { motion } from "framer-motion";
import { MenuItem } from "./MenuItem";
import { BrandItem } from "./BrandItem";
import { useDimensions } from "./use-dimensions";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

/* const itemIds = [0,1,2,3,4]; */
const itemIds = [0, 1, 2, 3,4,5];

export const Navigation = (props) => {
  const ref = React.useRef(null);
  React.useEffect(() =>{
    console.log('runing');
    if (ref.current){
      //let {h} = useDimensions(ref);
      let t = ref.current;
      let h = t.offsetHeight;
      console.log(h);
      //console.log(h);
      //props.setH(h);
    }

  })

  
  return (
  <motion.ul id="content-nav-container" ref={ref} variants={variants}>
      <BrandItem />
    {itemIds.map(i => (
      <MenuItem i={i} key={i} />
    ))}
    <MenuItem i={6} key={6} />
  </motion.ul>
)};


