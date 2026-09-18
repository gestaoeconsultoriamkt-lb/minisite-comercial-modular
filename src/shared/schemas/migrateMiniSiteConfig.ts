import {
  MINISITE_CONFIG_CURRENT_VERSION,
  miniSiteConfigSchema,
  type MiniSiteConfig,
} from "./miniSiteConfig";

export interface MigratedMiniSiteConfig {
  version: number;
  config: MiniSiteConfig;
}

/**
 * Ponto único de normalização/migração do `config_json`. Toda leitura de um
 * `minisite` (editor, preview, SSR público) deve passar por aqui antes de
 * usar os dados — nunca ler `config_json` cru.
 *
 * V1: só reconhece a versão 1. Versões futuras devem adicionar um `case`
 * que transforma o JSON antigo para o shape atual antes de validar.
 */
export function migrateMiniSiteConfig(rawConfigJson: string, storedVersion: number): MigratedMiniSiteConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawConfigJson);
  } catch {
    throw new Error("config_json inválido: não é um JSON bem formado");
  }

  switch (storedVersion) {
    case 1:
      return { version: 1, config: miniSiteConfigSchema.parse(parsed) };
    default:
      throw new Error(
        `Versão de config_json não suportada: ${storedVersion}. Nenhuma rota de migração definida ainda.`,
      );
  }
}

export function createDefaultMiniSiteConfig(): MiniSiteConfig {
  return miniSiteConfigSchema.parse({});
}

export function serializeMiniSiteConfig(config: MiniSiteConfig): {
  configJson: string;
  configVersion: number;
} {
  return {
    configJson: JSON.stringify(miniSiteConfigSchema.parse(config)),
    configVersion: MINISITE_CONFIG_CURRENT_VERSION,
  };
}
