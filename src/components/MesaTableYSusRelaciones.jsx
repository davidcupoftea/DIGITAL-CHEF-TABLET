import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { BASE_URL } from "../services/index.jsx";

const MesaTableYSusRelaciones = ({ table, tablesInRoom = [], apiUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTable, setEditableTable] = useState({ ...table });
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false)

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  useEffect(() => {
    setEditableTable({ ...table });
  }, [table]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const normalized = {
        ...editableTable,
        number_of_comensals: Number(editableTable.number_of_comensals) || 0,
      };

      const response = await fetch(
        `${BASE_URL}tables-edition/${editableTable.id}/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
          body: JSON.stringify(normalized),
        }
      );

      // if (!response.ok) {
      //   throw new Error("Error al guardar los cambios");
      // }

      const data = await response.json();
      if (data.status == "ok") {
        setEditableTable(data.mesa);
        setIsEditing(false);
        Alert.alert("Éxito", data.message);
      } else {
        //setEditableTable(data);
        setIsEditing(false);
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      //console.error("❌ Error guardando mesa:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditableTable({ ...table });
    setIsEditing(false);
  };

  const toggleNearTable = (id) => {
    const current = editableTable.tables_near || [];
    if (current.includes(id)) {
      setEditableTable({
        ...editableTable,
        tables_near: current.filter((tid) => tid !== id),
      });
    } else {
      setEditableTable({
        ...editableTable,
        tables_near: [...current, id],
      });
    }
  };

  const renderBadge = (label) => (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta mesa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `${BASE_URL}tables-delete/${editableTable.id}/`,
                {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens?.access),
                  },
                }
              );

              const data = await response.json();
              if (data.status === "ok") {
                Alert.alert("Éxito", data.message);
                //f (onDeleted) onDeleted(editableTable.id);
                setDeleted(true)
              } else {
                Alert.alert("Error", data.message);
              }
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar la mesa");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (deleted){
   return (null)
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {editableTable.name_of_the_table || `Mesa ${editableTable.id}`}
        </Text>

        <TouchableOpacity
          style={isEditing ? styles.cancelButton : styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Cancelar" : "Editar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          C. max.: {editableTable.number_of_comensals}
        </Text>
        <View style={styles.badgesContainer}>
          {editableTable.in_patio ? renderBadge("Patio") : null}
          {editableTable.near_a_window ? renderBadge("Ventana") : null}
          {editableTable.movable ? renderBadge("Móvil") : null}
          {editableTable.square ? renderBadge("Cuadrada") : null}
        </View>
      </View>

      {isEditing ? (
        <>
          {/* Campos básicos */}
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={String(editableTable.name_of_the_table || "")}
            onChangeText={(text) =>
              setEditableTable({ ...editableTable, name_of_the_table: text })
            }
            placeholder="Nombre de la mesa"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Número de comensales</Text>
          <TextInput
            style={styles.input}
            value={String(editableTable.number_of_comensals || "")}
            onChangeText={(text) =>
              setEditableTable({
                ...editableTable,
                number_of_comensals: text.replace(/\D/g, ""),
              })
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />

          {/* Switches */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>En patio</Text>
            <Switch
              value={!!editableTable.in_patio}
              onValueChange={(val) =>
                setEditableTable({ ...editableTable, in_patio: val })
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Cerca de ventana</Text>
            <Switch
              value={!!editableTable.near_a_window}
              onValueChange={(val) =>
                setEditableTable({ ...editableTable, near_a_window: val })
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Móvil</Text>
            <Switch
              value={!!editableTable.movable}
              onValueChange={(val) =>
                setEditableTable({ ...editableTable, movable: val })
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Choque con pared inevitable</Text>
            <Switch
              value={!!editableTable.unavoidable_hitting_the_wall}
              onValueChange={(val) =>
                setEditableTable({
                  ...editableTable,
                  unavoidable_hitting_the_wall: val,
                })
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Asientos a los lados</Text>
            <Switch
              value={!!editableTable.spot_at_the_sides}
              onValueChange={(val) =>
                setEditableTable({ ...editableTable, spot_at_the_sides: val })
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {editableTable.square ? "Mesa cuadrada" : "Mesa redonda"}
            </Text>
            <Switch
              value={!!editableTable.square}
              onValueChange={(val) =>
                setEditableTable({ ...editableTable, square: val })
              }
            />
          </View>

          {/* Selección de mesas cercanas */}
          <Text style={styles.label}>Mesas cercanas (para unir)</Text>
          <View style={styles.nearTablesContainer}>
            {tablesInRoom
              .filter((t) => t.id !== editableTable.id)
              .map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.nearTableItem,
                    editableTable.tables_near?.includes(t.id) &&
                      styles.nearTableItemSelected,
                  ]}
                  onPress={() => toggleNearTable(t.id)}
                >
                  <Text
                    style={[
                      styles.nearTableText,
                      editableTable.tables_near?.includes(t.id) &&
                        styles.nearTableTextSelected,
                    ]}
                  >
                    {t.name_of_the_table}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#ffcdcd",
    marginLeft: 6,
  },
  editButtonText: {
    color: "#222",
    fontWeight: "600",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    color: "#555",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 12,
    color: "#333",
  },
  label: {
    marginTop: 10,
    color: "#444",
    fontWeight: "600",
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    color: "#222",
    backgroundColor: "#fff",
  },
  switchRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    color: "#333",
  },
  nearTablesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  nearTableItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f9f9f9",
  },
  nearTableItemSelected: {
    backgroundColor: "#2271b3",
    borderColor: "#2271b3",
  },
  nearTableText: {
    color: "#333",
  },
  nearTableTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#28a745",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#222",
    fontWeight: "600",
  },
    deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MesaTableYSusRelaciones;
