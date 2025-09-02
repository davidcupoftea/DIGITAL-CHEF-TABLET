import Restaurants from '../src/components/Restaurants.jsx'
import ClaimMembershipToRestaurantDrawer from '../src/components/ClaimMembershipToRestaurantDrawer.jsx';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navOptions } from './options';
const Stack = createNativeStackNavigator();

export const RestaurantsStack = () => {
    const navigation = useNavigation()
    return (
      <Stack.Navigator initialRouteName="Restaurante seleccionado" screenOptions={() => navOptions(navigation)}>
        <Stack.Screen name="Restaurante seleccionado" component={Restaurants} />
        <Stack.Screen name="Únete a uno o varios restaurantes" component={ClaimMembershipToRestaurantDrawer} />
      </Stack.Navigator>
    );
  }

  //REPASADO Y LIMPIO