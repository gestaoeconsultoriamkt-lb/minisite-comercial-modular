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

/**
 * MiniSites NOVOS recebem um default mais premium do que o default de
 * schema (que existe para preservar a aparência de registros antigos —
 * ver comentário em `appearanceSchema.bodyStyle`). Só `bodyStyle` diverge
 * de fato; os demais já usam o mesmo valor do schema, repetidos aqui só
 * por clareza/robustez a uma futura mudança do default de schema.
 */
export function createDefaultMiniSiteConfig(): MiniSiteConfig {
  const base = miniSiteConfigSchema.parse({});
  return {
    ...base,
    appearance: {
      ...base.appearance,
      backgroundMode: "image_blurred",
      bodyStyle: "acrylic",
    },
  };
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
