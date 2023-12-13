// App.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  FlatList,
  Text,
} from "react-native";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [db, setDb] = useState(SQLite.openDatabase("example.db"));
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    fullname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    createTable();
    fetchUsers();
  }, []);

  const createTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, fullname TEXT, email TEXT, phone TEXT, password TEXT)"
      );
    });
  };

  const fetchUsers = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM users", [], (_, resultSet) => {
        setUsers(resultSet.rows._array);
      });
    });
    setIsLoading(false);
  };

  const addUser = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)",
          [
            formData.fullname,
            formData.email,
            formData.phone,
            formData.password,
          ],
          (_, resultSet) => {
            setFormData({
              id: null,
              fullname: "",
              email: "",
              phone: "",
              password: "",
            });
          },
          (_, error) => console.error(error)
        );
      },
      // Callback after the transaction is complete
      () => {
        fetchUsers(); // Call fetchUsers after the transaction is complete
      }
    );
  };

  const deleteUser = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM users WHERE id = ?",
        [id],
        (_, resultSet) => {
          fetchUsers();
        },
        (_, error) => console.error(error)
      );
    });
  };

  const updateUser = () => {
    if (!formData.id) {
      console.error("No user selected for update");
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE users SET fullname = ?, email = ?, phone = ?, password= ? WHERE id = ?",
        [
          formData.fullname,
          formData.email,
          formData.phone,
          formData.password,
          formData.id,
        ],
        (_, resultSet) => {
          fetchUsers();
          setFormData({
            id: null,
            fullname: "",
            email: "",
            phone: "",
            password: "",
          });
        },
        (_, error) => console.error(error)
      );
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const selectUserForUpdate = (item) => {
    setFormData({
      id: item.id,
      fullname: item.fullname,
      email: item.email,
      phone: item.phone,
      password: item.password,
    });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.columnContainer, selectAll && styles.selectedRow]}>
      <Text style={styles.column}>{item.fullname}</Text>
      <Text style={styles.column}>{item.email}</Text>
      <Text style={styles.column}>{item.phone}</Text>
      <Text style={styles.column}>{item.password}</Text>
      <Button
        style={styles.button1}
        title="Delete"
        onPress={() => deleteUser(item.id)}
      />
      <Button
        style={styles.button1}
        title="Update"
        onPress={() => selectUserForUpdate(item)}
      />
    </View>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.selectAllText}>Select All</Text>
        <Button
          title={selectAll ? "Deselect All" : "Select All"}
          onPress={toggleSelectAll}
        />
      </View>
      <TextInput
        style={styles.input}
        value={formData.fullname}
        placeholder="Full Name"
        onChangeText={(text) => setFormData({ ...formData, fullname: text })}
      />
      <TextInput
        style={styles.input}
        value={formData.email}
        placeholder="Email"
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />
      <TextInput
        style={styles.input}
        value={formData.phone}
        placeholder="Phone Number"
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
      />
      <TextInput
        style={styles.input}
        value={formData.password}
        placeholder="Password"
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />
      <View style={styles.button}>
        <Button style={styles.Button} title="Add User" onPress={addUser} />
        <Button title="Update User" onPress={updateUser} />
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    color: "red",
    // Add margin bottom to all buttons
  },
  button1: {
    padding: 2, // Add margin bottom to all buttons
  },
  Button: {
    // Add margin bottom to all buttons
    backgroundColor: "red",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "lightgray",
  },
  columnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "lightgray",
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  selectedRow: {
    backgroundColor: "blue",
  },
  selectAllText: {
    fontWeight: "bold",
    marginRight: 8,
  },
});
