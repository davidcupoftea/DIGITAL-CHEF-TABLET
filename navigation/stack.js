import { createNativeStackNavigator } from '@react-navigation/native-stack';

import VerPedidos from '../src/components/VerPedidos.jsx'
import ElegirEntrega from '../src/components/ElegirEntrega.jsx'
import ElegirProductos from '../src/components/ElegirProductos.jsx'
import CouponsAndSuggestions from '../src/components/CouponsAndSuggestions.jsx'
import ConfirmarPedido from '../src/components/ConfirmarPedido.jsx'
import OrderScreen from '../src/components/OrderScreen.jsx'
import FacturaCompleta from '../src/components/FacturaCompleta.jsx'
import FacturaRectificativa from '../src/components/FacturaRectificativa.jsx'


import Reserva from '../src/components/Reserva.jsx';
import DoReservation from '../src/components/DoReservation.jsx'
import EditReservation from '../src/components/EditReservation.jsx'
import Colisiones from '../src/components/Colisiones.jsx'

import Noticias from '../src/components/Noticias'
import NewsScreen from '../src/components/NewsScreen'
import NewScreenCreation from '../src/components/NewScreenCreation'

import Ofertas from '../src/components/Ofertas'
import OfferScreen from '../src/components/OfferScreen.jsx'
import OfferScreenCreation from '../src/components/OfferScreenCreation.jsx'

import Sorteos from '../src/components/Sorteos'
import SorteoScreen from '../src/components/SorteoScreen'
import SorteoScreenCreation from '../src/components/SorteoScreenCreation'

import Carta from '../src/components/CartaDropDown'
import DishScreen from '../src/components/DishScreen.jsx'
import DishScreenCreation from '../src/components/DishScreenCreation.jsx'

import Localizacion from '../src/components/Localizacion'
import MiInfo from '../src/components/MiInfo'
import ManageTeam from '../src/components/ManageTeam'

import TermsAndPrivacyDrawer from '../src/components/TermsAndPrivacyDrawer.jsx';

import Trabajos from '../src/components/Trabajos'
import TrabajosScreen from '../src/components/TrabajosScreen'
import TrabajoScreenCreation from '../src/components/TrabajoScreenCreation'

import Recompensas from '../src/components/Recompensas.jsx'
import RewardScreen from '../src/components/RewardScreen.jsx'
import RewardScreenCreation from '../src/components/RewardScreenCreation.jsx'
import RecompensasReclamadas from '../src/components/RecompensasReclamadas.jsx'

import Emails from '../src/components/Emails.jsx';
import EmailCreation from '../src/components/EmailCreation.jsx';
import EmailEdit from '../src/components/EmailEdit.jsx'
import CampaignEmails from '../src/components/CampaignEmails.jsx'

import NotificacionesPush from '../src/components/NotificacionesPush.jsx';
import NotificacionPushCreation from '../src/components/NotificacionPushCreation.jsx';
import NotificacionPushEdit from '../src/components/NotificacionPushEdit.jsx'

import Impresoras from '../src/components/Impresoras.jsx'

import Facturas from '../src/components/Facturas.jsx'
import Registros from '../src/components/Registros.jsx'
import RegistrosYFacturas from '../src/components/RegistrosYFacturas.jsx'
import PanelControl from '../src/components/PanelControl.jsx'
import ConfirmarPedidoParaPanelDeControl from '../src/components/ConfirmarPedidoParaPanelDeControl.jsx'
import ElegirProductosDesdePanelDeControl from '../src/components/ElegirProductosDesdePanelDeControl.jsx'
import FacturaCompletaPanelControl from '../src/components/FacturaCompletaPanelControl.jsx'
import DeSimplificadaAOrdinaria from '../src/components/DeSimplificadaAOrdinaria.jsx'
import Contabilidad from '../src/components/Contabilidad.jsx'
import Horario from '../src/components/Horario.jsx'
import Horas from '../src/components/Horas.jsx'
import CerrarDia from '../src/components/CerrarDia.jsx'
import DeclaracionResponsable from '../src/components/DeclaracionResponsable.jsx'
import MenuCategoryCreation from '../src/components/MenuCategoryCreation.jsx'
import CrearHora from '../src/components/CrearHora.jsx'
import MesasYRelaciones from '../src/components/MesasYRelaciones.jsx'
import CrearMesa from '../src/components/CrearMesa.jsx'
import CrearSala from '../src/components/CrearSala.jsx'

import { navOptions } from './options';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();


export const PanelControlStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Panel de control" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Panel de control" component={PanelControl} />
      <Stack.Screen name="Elegir Productos para la mesa" component={ElegirProductosDesdePanelDeControl} />
      <Stack.Screen name="Sugerencias y Cupones" component={CouponsAndSuggestions} />
      <Stack.Screen name="Confirmar Pedido" component={ConfirmarPedidoParaPanelDeControl} />
      <Stack.Screen name="Factura Completa Desde Panel De Control" component={FacturaCompletaPanelControl} />
      <Stack.Screen name="Mesas y Relaciones" component={MesasYRelaciones}/>
      <Stack.Screen name="Crear mesa" component={CrearMesa}/>
      <Stack.Screen name="Crear sala" component={CrearSala}/>
    </Stack.Navigator>
  )
}

export const PedidoStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Ver pedidos" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Ver pedidos" component={VerPedidos} />
      <Stack.Screen name="Elegir Entrega" component={ElegirEntrega} />
      <Stack.Screen name="Elegir Productos" component={ElegirProductos} />
      <Stack.Screen name="Sugerencias y Cupones" component={CouponsAndSuggestions} />
      <Stack.Screen name="Confirmar Pedido" component={ConfirmarPedido} />
      <Stack.Screen name="Pedido en Detalle" component={OrderScreen} />
      <Stack.Screen name="Factura Completa" component={FacturaCompleta} />
      <Stack.Screen name="Factura Rectificativa" component={FacturaRectificativa} />
    </Stack.Navigator>
  )
}

export const ReservaStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Reserva" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Reserva" component={Reserva} />
      <Stack.Screen name="Hacer reserva" component={DoReservation} />
      <Stack.Screen name="Editar reserva" component={EditReservation} />
      <Stack.Screen name="Colisiones" component={Colisiones} />
    </Stack.Navigator>
  )
}

export const NovedadesStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Novedades" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Novedades" component={Noticias} />
      <Stack.Screen name="Novedad" component={NewsScreen} />
      <Stack.Screen name="Creación de novedad" component={NewScreenCreation} />
    </Stack.Navigator>
  );
}

export const OfertasStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Ofertas y Promociones" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Ofertas y Promociones" component={Ofertas} />
      <Stack.Screen name="Oferta/Promoción" component={OfferScreen} />
      <Stack.Screen name="Creación de oferta" component={OfferScreenCreation} />
    </Stack.Navigator>
  );
}

export const SorteosStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Sorteos" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Sorteos" component={Sorteos} />
      <Stack.Screen name="Sorteo" component={SorteoScreen} />
      <Stack.Screen name="Creación de sorteo" component={SorteoScreenCreation} />
    </Stack.Navigator>
  );
}

export const CartaStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Carta y Stock" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Carta y Stock" component={Carta} />
      <Stack.Screen name="Plato en detalle" component={DishScreen} />
      <Stack.Screen name="Creación de plato" component={DishScreenCreation} />
      <Stack.Screen name="Crear Categoría del Menú" component={MenuCategoryCreation} />
    </Stack.Navigator>
  );
}


export const TrabajarStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Trabajos" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Trabajos" component={Trabajos} />
      <Stack.Screen name="Trabajo" component={TrabajosScreen} />
      <Stack.Screen name="Creación de trabajo" component={TrabajoScreenCreation} />
    </Stack.Navigator>
  );
}

export const EmailStack = () => {
  const navigation = useNavigation()
  return (
      <Stack.Navigator initialRouteName="Emails" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Emails" component={Emails} />
      <Stack.Screen name="Creación de email" component={EmailCreation} />
      <Stack.Screen name="Edición de email" component={EmailEdit} />
      <Stack.Screen name="Emails de la campaña" component={CampaignEmails} />
    </Stack.Navigator>
  )
}

export const PushNotificationStack = () => {
  const navigation = useNavigation()
  return (
      <Stack.Navigator initialRouteName="Notificaciones Push" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Notificaciones Push" component={NotificacionesPush} />
      <Stack.Screen name="Creación de notificación" component={NotificacionPushCreation} />
      <Stack.Screen name="Edición de notificación" component={NotificacionPushEdit} />
    </Stack.Navigator>
  )
}

export const RegistroStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Registros" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Registros" component={Registros} />
    </Stack.Navigator>
  );
}

export const FacturaStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Facturas" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Facturas" component={Facturas} />
      <Stack.Screen name="Factura Rectificativa" component={FacturaRectificativa} />
      <Stack.Screen name="De simplificada a ordinaria" component={DeSimplificadaAOrdinaria} />
    </Stack.Navigator>
  );
}

export const RegistrosYFacturasStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Registros Y Facturas" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Registros Y Facturas" component={RegistrosYFacturas} />
      <Stack.Screen name="Factura Rectificativa" component={FacturaRectificativa} />
    </Stack.Navigator>
  );
}

export const ContabilidadStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Contabilidad" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Contabilidad" component={Contabilidad} />
    </Stack.Navigator>
  );
}

export const LocalizacionStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Dónde estamos" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Dónde estamos" component={Localizacion} />
    </Stack.Navigator>
  );
}

export const ImpresorasStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Impresoras" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Impresoras" component={Impresoras} />
    </Stack.Navigator>
  );
}

export const MiInfoStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Mi Info" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Mi Info" component={MiInfo} />
      <Stack.Screen name="Gestionar Equipo" component={ManageTeam} />
      <Stack.Screen name="Términos y condiciones" component={TermsAndPrivacyDrawer} />
    </Stack.Navigator>
  );
}


export const RecompensaStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Recompensas" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Recompensas" component={Recompensas} />
      <Stack.Screen name="Editar recompensa" component={RewardScreen} />
      <Stack.Screen name="Crear recompensa" component={RewardScreenCreation} />
      <Stack.Screen name="Ver códigos de recompensa" component={RecompensasReclamadas} />
    </Stack.Navigator>
  );
}

export const HorarioStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Horario" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Horario" component={Horario} />
      <Stack.Screen name="Editar horas" component={Horas} />
      <Stack.Screen name="Crear hora" component={CrearHora} />
      <Stack.Screen name="Cerrar un día" component={CerrarDia} />
    </Stack.Navigator>
  );
}

export const DeclaracionResponsableStack = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator initialRouteName="Declaración Responsable" screenOptions={() => navOptions(navigation)}>
      <Stack.Screen name="Declaración Responsable" component={DeclaracionResponsable} />
    </Stack.Navigator>
  );
}

//REPASADO Y LIMPIO