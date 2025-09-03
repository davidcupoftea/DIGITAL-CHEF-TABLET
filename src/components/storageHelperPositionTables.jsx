import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar posición de todas las mesas
export const guardarPosiciones = async (mesas) => {
  try {
    const posiciones = mesas.map(m => ({
      id: m.id,
      x: m.x,
      y: m.y
    }));
    await AsyncStorage.setItem('posicionesMesas', JSON.stringify(posiciones));
  } catch (e) {
    console.log('Error guardando posiciones:', e);
  }
};

// Cargar posiciones al iniciar
export const cargarPosiciones = async () => {
  try {
    const json = await AsyncStorage.getItem('posicionesMesas');
    if (json != null) {
      const posiciones = JSON.parse(json);
      return posiciones; // [{id, x, y}, ...]
    }
  } catch (e) {
    console.log('Error cargando posiciones:', e);
  }
  return [];
};