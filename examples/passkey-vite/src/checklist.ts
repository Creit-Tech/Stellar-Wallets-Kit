/**
 * The run record: five guided steps the page verifies itself. It persists in localStorage
 * so a reload (step 5 needs one) keeps the evidence.
 */

export type Verdict = "untested" | "pass" | "fail" | "skip";

/** One thing the page verifies after the step's action. */
export interface Check {
  id: string;
  label: string;
}

export interface Step {
  id: string;
  title: string;
  /** One line on what the button does. */
  intro: string;
  /** Which mode the step needs. The page disables it elsewhere. */
  needs: "any" | "testnet";
  checks: Check[];
}

export const STEPS: Step[] = [
  {
    id: "connect",
    title: "Connect through the kit picker",
    intro: "Opens the kit's own wallet modal. Passkey sits next to Freighter, LOBSTR and xBull. Pick it and approve the OS sheet.",
    needs: "any",
    checks: [
      { id: "address", label: "The kit returns a C-address" },
    ],
  },
  {
    id: "sign",
    title: "Sign a transaction",
    intro: "Builds an add_signer call the account must authorize and signs it through the kit.",
    needs: "any",
    checks: [
      { id: "accepted", label: "The account's __check_auth accepts the signature" },
    ],
  },
  {
    id: "wrong-key",
    title: "Reject a wrong key",
    intro: "Signs the same call with a random software key instead of the passkey and submits it. No OS sheet this time.",
    needs: "testnet",
    checks: [
      { id: "rejected", label: "The network rejects the transaction" },
    ],
  },
  {
    id: "reconnect",
    title: "Disconnect, then reconnect",
    intro: "Disconnect through the kit, then open the modal again and pick Passkey.",
    needs: "any",
    checks: [
      { id: "cleared", label: "Disconnect clears the account" },
      { id: "same", label: "Reconnect returns the address from step 1" },
      { id: "nodeploy", label: "No new account is deployed" },
    ],
  },
  {
    id: "returning",
    title: "Come back as a returning visitor",
    intro: "Reload clears the page. The remembered credential and the factory address are all the module has left.",
    needs: "testnet",
    checks: [
      { id: "same", label: "Same address as step 1" },
      { id: "noceremony", label: "No authenticator ceremony (no OS sheet)" },
      { id: "norpc", label: "No RPC call" },
    ],
  },
];

export interface StepResult {
  verdict: Verdict;
  /** Plain-text evidence the page captured (address, hash, timing). */
  evidence: string;
  /** Links the page renders next to the evidence. */
  links: { label: string; href: string }[];
  /** Per check: true passed / confirmed, false failed, null not yet. */
  checks: Record<string, boolean | null>;
  /** A person flagged the step as wrong regardless of the checks. */
  flagged: boolean;
  note: string;
  /** The address the step produced, so later steps can compare against it. */
  address?: string;
}

export interface Run {
  steps: Record<string, StepResult>;
}

const STORE = "swk-passkey-example-run";

export function loadRun(): Run {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) ?? "{}") as Partial<Run>;
    return { steps: parsed.steps ?? {} };
  } catch {
    return { steps: {} };
  }
}

export function saveRun(run: Run): void {
  localStorage.setItem(STORE, JSON.stringify(run));
}

export function emptyStep(): StepResult {
  return { verdict: "untested", evidence: "", links: [], checks: {}, flagged: false, note: "" };
}

/** The step's verdict follows its checks: every one true is a pass, any false or a flag is a fail. */
export function deriveVerdict(step: Step, r: StepResult): Verdict {
  if (r.flagged) return "fail";
  const states = step.checks.map((c) => r.checks[c.id] ?? null);
  if (states.some((v) => v === false)) return "fail";
  if (states.every((v) => v === true)) return "pass";
  return "untested";
}
