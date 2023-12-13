import { AppRegistry, Platform } from "react-native";
import App from "./App";

AppRegistry.registerComponent("awesomeproject", () => App);

if (Platform.OS === "web") {
  const rootTag =
    document.getElementById("root") || document.getElementById("awesomeproject");
  AppRegistry.runApplication("awesomeproject", { rootTag });
}
