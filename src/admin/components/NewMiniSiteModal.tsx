import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { slugify } from "../lib/slugify";
import { createMiniSite, MiniSiteApiError, type MiniSiteListItem } from "../lib/minisitesApi";

interface NewMiniSiteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (minisite: MiniSiteListItem) => void;
}

export function NewMiniSiteModal({ open, onClose, onCreated }: NewMiniSiteModalProps) {
  const [internalName, setInternalName] = useState("");
  const [niche, setNiche] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  function reset() {
    setInternalName("");
    setNiche("");
    setSlug("");
    setSlugTouched(false);
    setDisplayName("");
    setError(null);
    setSlugError(null);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  function handleInternalNameChange(value: string) {
    setInternalName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function validateSlugFormat(value: string): string | null {
    if (!value) return "Informe o endereço do MiniSite";
    if (!isValidSlugFormat(value)) return "Use apenas letras minúsculas, números e hífen (3–50 caracteres)";
    if (isReservedSlug(value)) return "Esse endereço não pode ser usado. Escolha outro.";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const slugValidationError = validateSlugFormat(slug);
    if (internalName.trim().length < 2) {
      setError("Informe o nome interno do negócio.");
      return;
    }
    if (!niche.trim()) {
      setError("Informe o nicho do negócio.");
      return;
    }
    if (slugValidationError) {
      setSlugError(slugValidationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSlugError(null);

    try {
      const minisite = await createMiniSite({
        internalName: internalName.trim(),
        niche: niche.trim(),
        slug,
        displayName: displayName.trim() || undefined,
      });
      reset();
      onCreated(minisite);
    } catch (err) {
      if (err instanceof MiniSiteApiError && (err.code === "SLUG_TAKEN" || err.code === "SLUG_RESERVED")) {
        setSlugError(err.message);
      } else if (err instanceof MiniSiteApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível criar o MiniSite. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo MiniSite">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}

        <TextField
          label="Nome interno do negócio"
          name="internalName"
          placeholder="Ex.: Padaria Treze"
          value={internalName}
          onChange={(e) => handleInternalNameChange(e.target.value)}
          required
          autoFocus
        />

        <TextField
          label="Nicho"
          name="niche"
          placeholder="Ex.: Alimentação"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          required
        />

        <TextField
          label="Endereço (slug)"
          name="slug"
          placeholder="ex-padaria-treze"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          error={slugError ?? undefined}
          required
        />
        <p className="-mt-3 truncate text-xs text-slate-400">
          {typeof window !== "undefined" ? window.location.host : ""}/{slug || "seu-slug"}
        </p>

        <TextField
          label="Nome público (opcional)"
          name="displayName"
          placeholder="Nome exibido no MiniSite"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" fullWidth={false} onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth={false} loading={loading}>
            Criar MiniSite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
