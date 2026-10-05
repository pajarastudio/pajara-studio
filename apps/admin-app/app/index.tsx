import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function AdminHome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Login Admin", "Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login gagal", error.message);
      return;
    }

    Alert.alert("Berhasil", "Login admin berhasil.");
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>PAJARA STUDIO</Text>

        <Text style={styles.title}>Admin Panel</Text>

        <Text style={styles.subtitle}>
          Kelola pesanan dan layanan Pajara Studio.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email admin"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Memproses..." : "Masuk sebagai Admin"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ee",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: "#e8e2d8",
  },

  brand: {
    color: "#8a6a4a",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  title: {
    color: "#214d32",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 26,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#d8d0c4",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#ffffff",
    marginBottom: 14,
  },

  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2f6b45",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
