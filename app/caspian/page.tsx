import { CaspianShell } from "./CaspianShell";
import { Overview } from "./Overview";

export default function CaspianPage() {
  return <CaspianShell overview={<Overview />} />;
}
