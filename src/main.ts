import { setUser, readConfig } from "./config";

function main() {
  // Use YOUR name instead of Lane
  setUser("Mohammed");

  const cfg = readConfig();

  console.log("Config loaded:");
  console.log(cfg);
}

main();
