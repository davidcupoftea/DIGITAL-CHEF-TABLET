import { useState, createContext, useEffect, useMemo } from "react";

export const FacturadosContext = createContext({
  conceptosFacturadosObject: [null, ()=>{}],
  añadirConceptosFacturados: () =>{},
  limpiarConceptosFacturados: () =>{},
  itemsFacturadosObject: [null, ()=>{}],
  añadirItemsFacturados: () =>{},
  limpiarItemsFacturados: () =>{},
});

const ConceptosFacturadosProvider = ({ children }) => {
  const [conceptosFacturados, setConceptosFacturados] = useState([]);
  const [itemsFacturados, setItemsFacturados] = useState([])

const añadirConceptosFacturados = (nuevosConceptos) => {
  setConceptosFacturados((prev) => [
    ...prev,
    ...nuevosConceptos.filter((id) => !prev.includes(id)),
  ]);
};

const añadirItemsFacturados = (nuevosItems) => {
  setItemsFacturados((prev) => [
    ...prev,
    ...nuevosItems.filter((id) => !prev.includes(id)),
  ]);
};

// useEffect(()=>{
//   console.log('conceptosFacturados son', conceptosFacturados)

// }, [conceptosFacturados])

// useEffect(()=>{
//   console.log('itemsFacturados son', itemsFacturados)

// }, [itemsFacturados])

  const limpiarConceptosFacturados = () => {
    setConceptosFacturados([]);
  };

  const limpiarItemsFacturados = () => {
    setItemsFacturados([]);
  };

  const value = useMemo(
    () => ({
      conceptosFacturadosObject: [conceptosFacturados, setConceptosFacturados],
      añadirConceptosFacturados,
      limpiarConceptosFacturados,
      itemsFacturadosObject: [itemsFacturados, setItemsFacturados],
      añadirItemsFacturados,
      limpiarItemsFacturados,
    }),
    [
      conceptosFacturados,
      itemsFacturados
    ]
  );

  return (
    <FacturadosContext.Provider value={value}>
      {children}
    </FacturadosContext.Provider>
  );
};

export default ConceptosFacturadosProvider;

//REPASADO Y LIMPIADO 
