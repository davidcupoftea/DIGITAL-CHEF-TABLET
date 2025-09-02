import { useState, createContext, useMemo, useEffect } from "react";
import "core-js/stable/atob";
export const OrderContext = createContext({});

const OrderProvider = ({ children }) => {
  let [order, setOrder] = useState({products : []})
  return (
    <OrderContext.Provider value={{order, setOrder}}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
//REVISADO Y LIMPIADO

