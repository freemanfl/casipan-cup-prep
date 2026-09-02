import { CaspianShell } from "./CaspianShell";
import { Glossary } from "./Glossary";
import { OverviewDashboard } from "./OverviewDashboard";

export default function CaspianPage() {
  return (
    <CaspianShell overview={<OverviewDashboard />} baza={<Glossary />} />
  );
}
