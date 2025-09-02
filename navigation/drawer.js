import { DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { NovedadesStack, OfertasStack, LocalizacionStack, MiInfoStack, SorteosStack, TrabajarStack, CartaStack, ReservaStack, RecompensaStack, PedidoStack, ImpresorasStack, RegistroStack, FacturaStack, RegistrosYFacturasStack, PanelControlStack, EmailStack, PushNotificationStack, ContabilidadStack, HorarioStack } from './stack';
import { ScrollView, View, StatusBar} from 'react-native';
import { Image } from 'react-native';
import { RestaurantsStack } from './RestaurantsStack.js'
import { DeclaracionResponsableStack } from './stack';

const Drawer = createDrawerNavigator();

export const MyDrawer = () =>{
    return (
        <Drawer.Navigator 
        drawerContent={(props) =>{
            return (
                <ScrollView>
                <View style={{ flex: 1, paddingTop: 50, backgroundColor: 'white', marginTop: StatusBar.currentHeight + 20}}>
                    <View style={{justifyContent: 'center', alignItems: 'center', height: 140}}>
                        <Image
                        style={{height: 150, width: 150, marginBottom: 50}}
                        source={require("../assets/logo2.png")}
                         />
                    </View>
                    <DrawerItemList {...props}/>
                </View>
                </ScrollView>
            );
            }}
        screenOptions={{headerShown: false}}>
            <Drawer.Screen name="PanelControl-Drawer" component={PanelControlStack} options={{title: 'Panel de Control'}}/>
            <Drawer.Screen name="Pedido-Drawer" component={PedidoStack} options={{title: 'Pedidos'}}/>
            <Drawer.Screen name="Reserva-Drawer" component={ReservaStack} options={{title: 'Reservas'}}/>
            <Drawer.Screen name="Carta-Drawer" component={CartaStack} options={{title: 'Carta y Stock'}}/>
            <Drawer.Screen name="Novedades-Drawer" component={NovedadesStack} options={{title: 'Novedades'}}/>
            <Drawer.Screen name="Ofertas" component={OfertasStack} options={{title: 'Ofertas'}}/>
            <Drawer.Screen name="Sorteos-Drawer" component={SorteosStack} options={{title: 'Sorteos'}}/>
            <Drawer.Screen name="Trabajo-Drawer" component={TrabajarStack} options={{title: 'Trabajos'}}/>
            <Drawer.Screen name="Mis recompensas-Drawer" component={RecompensaStack} options={{title: 'Recompensas'}}/>
            <Drawer.Screen name="Emails-Drawer" component={EmailStack} options={{title: 'Emails'}}/>
            <Drawer.Screen name="NotificacionesPush-Drawer" component={PushNotificationStack} options={{title: 'Notificaciones Push'}}/>
            <Drawer.Screen name="Horario-Drawer" component={HorarioStack} options={{title: 'Horario'}}/>
            <Drawer.Screen name="Mi restaurante predilecto-Drawer" component={RestaurantsStack} options={{title: 'Restaurante seleccionado'}}/>
            <Drawer.Screen name="Localización" component={LocalizacionStack} options={{title: '¿Dónde estamos?'}}/>
            <Drawer.Screen name="Registros de facturas" component={RegistroStack} options={{title: 'Registros'}}/>
            <Drawer.Screen name="Facturas-Drawer" component={FacturaStack} options={{title: 'Facturas'}}/>
            <Drawer.Screen name="Registros Y Facturas-Drawer" component={RegistrosYFacturasStack} options={{title: 'Registros y Facturas'}}/>
            <Drawer.Screen name="Contabilidad-Drawer" component={ContabilidadStack} options={{title: 'Contabilidad'}}/>
            <Drawer.Screen name="Impresoras-Drawer" component={ImpresorasStack} options={{title: 'Impresoras'}}/>
            <Drawer.Screen name="Mi información" component={MiInfoStack} options={{title: 'Mi info'}}/>
            <Drawer.Screen name="Declaración Responsable-Drawer" component={DeclaracionResponsableStack} options={{title: 'Declaración Responsable'}}/>
        </Drawer.Navigator>
    )
}

//REPASADO Y LIMPIO