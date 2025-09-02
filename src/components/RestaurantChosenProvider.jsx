import { useState, createContext, useMemo } from "react";
import "core-js/stable/atob";


export const RestaurantChosenContext = createContext({});

const RestaurantChosenProvider = ({ children }) => {

  let [restaurantChosen, setRestaurantChosen] = useState({})

  const value = useMemo(
    () => ({
      restaurantChosenObject: [restaurantChosen, setRestaurantChosen],
    }),
    [
      restaurantChosen
    ]
  );


  return (
    <RestaurantChosenContext.Provider value={value}>
      {children}
    </RestaurantChosenContext.Provider>
  );
};

export default RestaurantChosenProvider;

//REPASADO Y LIMPIADO
