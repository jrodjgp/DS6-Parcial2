import { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function App() {
  const [nota, setNota] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#10231F" />
      <View style={styles.shell}>
        <View style={styles.brandBand}>
          <Text style={styles.kicker}>PH operativo</Text>
          <Text style={styles.title}>Umbral</Text>
          <Text style={styles.subtitle}>Bitácora operativa para PHs</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prueba de escritura</Text>
          <TextInput
            style={styles.input}
            value={nota}
            onChangeText={setNota}
            placeholder="Escribe una nota del PH"
            placeholderTextColor="#5A6B66"
            selectionColor="#0E7C72"
          />

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Texto ingresado</Text>
            <Text style={styles.previewText}>
              {nota.trim() ? nota : 'Aqui aparecera lo que escribas.'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#10231F',
  },
  shell: {
    flex: 1,
    backgroundColor: '#F4EFE4',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brandBand: {
    backgroundColor: '#17443C',
    borderRadius: 18,
    padding: 24,
    borderBottomWidth: 6,
    borderBottomColor: '#F2B84B',
  },
  kicker: {
    color: '#DCEAE2',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF8EA',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#DCEAE2',
    fontSize: 18,
    lineHeight: 25,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF8EA',
    borderColor: '#DCEAE2',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
    padding: 18,
  },
  label: {
    color: '#10231F',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0E7C72',
    borderRadius: 10,
    borderWidth: 1,
    color: '#10231F',
    fontSize: 17,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  previewBox: {
    backgroundColor: '#DCEAE2',
    borderLeftColor: '#2BA7C9',
    borderLeftWidth: 5,
    borderRadius: 10,
    marginTop: 18,
    padding: 14,
  },
  previewLabel: {
    color: '#17443C',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  previewText: {
    color: '#10231F',
    fontSize: 17,
    lineHeight: 24,
  },
});
