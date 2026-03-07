import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  getPreferences,
  savePreferences,
} from "../src/services/userPreferencesService";

const BODY_TYPES = ["Slim", "Athletic", "Average", "Heavy"];

const STYLE_OPTIONS = [
  "Casual",
  "Formal",
  "Sporty",
  "Streetwear",
  "Minimal",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Brown",
  "Green",
  "Beige",
  "Grey",
];

const CONSTRAINT_OPTIONS = [
  "No Sleeveless",
  "Loose Fit",
  "Formal Only",
  "No Leather",
];

export default function EditProfile() {
  const router = useRouter();

  const [preferences, setPreferences] = useState<any>({});
  const [modalField, setModalField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>("");

  useEffect(() => {
    const load = async () => {
      const prefs = await getPreferences();
      setPreferences(prefs || {});
    };
    load();
  }, []);

  const openModal = (field: string) => {
    setModalField(field);
    setTempValue(preferences[field] || (field === "height" ? "" : []));
  };

  const toggleOption = (option: string) => {
    if (Array.isArray(tempValue)) {
      if (tempValue.includes(option)) {
        setTempValue(tempValue.filter((i: string) => i !== option));
      } else {
        setTempValue([...tempValue, option]);
      }
    } else {
      setTempValue(option);
    }
  };

  const handleSaveField = () => {
    setPreferences({
      ...preferences,
      [modalField!]: tempValue,
    });
    setModalField(null);
  };

  const handleSaveAll = async () => {
    await savePreferences(preferences);
    router.back();
  };

  const Row = ({ label, field }: any) => (
    <TouchableOpacity style={styles.row} onPress={() => openModal(field)}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.arrow}>{">"}</Text>
    </TouchableOpacity>
  );

  const renderChips = (options: string[], single = false) => (
    <View style={styles.chipContainer}>
      {options.map((option) => {
        const selected = Array.isArray(tempValue)
          ? tempValue.includes(option)
          : tempValue === option;

        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() =>
              single ? setTempValue(option) : toggleOption(option)
            }
          >
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderModalContent = () => {
    if (modalField === "height") {
      return (
        <TextInput
          style={styles.input}
          value={tempValue}
          onChangeText={setTempValue}
          keyboardType="numeric"
          placeholder="Enter height (cm)"
        />
      );
    }

    if (modalField === "bodyType") {
      return renderChips(BODY_TYPES, true);
    }

    if (modalField === "styles") {
      return renderChips(STYLE_OPTIONS);
    }

    if (modalField === "preferredColors") {
      return renderChips(COLOR_OPTIONS);
    }

    if (modalField === "constraints") {
      return renderChips(CONSTRAINT_OPTIONS);
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Row label="Height" field="height" />
      <Row label="Body Type" field="bodyType" />
      <Row label="Preferred Styles" field="styles" />
      <Row label="Color Preferences" field="preferredColors" />
      <Row label="Clothing Constraints" field="constraints" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAll}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      <Modal visible={modalField !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit {modalField}</Text>

            {renderModalContent()}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setModalField(null)}
            >
              <Text>Change anything else</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveField}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
  },

  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowLabel: {
    fontSize: 16,
  },

  arrow: {
    fontSize: 16,
    color: "#999",
  },

  saveButton: {
    marginTop: 30,
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
  },

  chipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },

  chipText: {
    fontSize: 14,
  },

  chipTextSelected: {
    color: "#fff",
  },

  primaryButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  secondaryButton: {
    padding: 12,
    alignItems: "center",
  },
});