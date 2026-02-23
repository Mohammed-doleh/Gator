import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig || typeof rawConfig !== "object") {
    throw new Error("Invalid config file format");
  }

  if (typeof rawConfig.db_url !== "string") {
    throw new Error("db_url must be a string");
  }

  if (
    rawConfig.current_user_name &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name must be a string");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();

  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(filePath, JSON.stringify(rawConfig, null, 2), {
    encoding: "utf-8",
  });
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();

  const fileContent = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  const parsed = JSON.parse(fileContent);

  return validateConfig(parsed);
}

// Set current user and save
export async function setUser(name: string): Promise<void> {
  const config = readConfig();
  config.currentUserName = name;   
  writeConfig(config);
}
