import { runCommand } from "./commands";

async function main() {
  await runCommand(process.argv.slice(2));
  process.exit(0);
}

main();