import { CaspianShell } from "./CaspianShell";
import { Glossary } from "./Glossary";
import { Overview } from "./Overview";

export default function CaspianPage() {
  return <CaspianShell overview={<Overview />} glossary={<Glossary />} />;
}
