export interface BootstrapStatus {
  signupAvailable: boolean;
}

export async function fetchBootstrapStatus(): Promise<BootstrapStatus> {
  const response = await fetch("/api/bootstrap-status");
  if (!response.ok) {
    // Falha aberta para "indisponível" — não expõe CTA de cadastro se não
    // conseguirmos confirmar o estado real do bootstrap.
    return { signupAvailable: false };
  }
  return response.json();
}
