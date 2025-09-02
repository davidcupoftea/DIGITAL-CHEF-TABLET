import { BASE_URL } from './index.jsx';

const getRestaurants = async (accessToken) => {
    const res2 = await fetch(BASE_URL + 'get-restaurants-digital-chef/', {
        method: "GET",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + String(accessToken)
        }
    })

    var jsonData2 = await res2.json()
    return [jsonData2.data, jsonData2.favourite_restaurant]

}

  const findRestaurantChosen = async (array, pk) => {
    found = await array.find((element) => element.pk == pk)
    return found
  }

  const getAndSetRestaurant = async (accessToken, setRestaurantChosen) => {
    const [allRestaurants, favourite_restaurant] = await getRestaurants(accessToken)
    if (favourite_restaurant != null) {
    const restaurant = await findRestaurantChosen(allRestaurants, favourite_restaurant)
    setRestaurantChosen(restaurant)
    }

    return favourite_restaurant
    

  }

  export const getAndSetRestaurantObject = async (accessToken) => {
    const [allRestaurants, favourite_restaurant] = await getRestaurants(accessToken)
    if (favourite_restaurant != null) {
    const restaurant = await findRestaurantChosen(allRestaurants, favourite_restaurant)
    return restaurant
  }
}



  export default getAndSetRestaurant

  //REPASADO Y REVISADO