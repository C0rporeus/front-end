import { useState } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput } from "@/components/UI/ToolInput";

type CidrResult = {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  subnetMask: string;
  wildcard: string;
  prefix: number;
};

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function numberToIp(num: number): string {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".");
}

function parseCidr(cidr: string): CidrResult | null {
  const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;

  const ip = match[1];
  const prefix = parseInt(match[2], 10);
  if (prefix < 0 || prefix > 32) return null;

  const parts = ip.split(".").map(Number);
  if (parts.some((p) => p < 0 || p > 255)) return null;

  const ipNum = ipToNumber(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardNum = (~mask) >>> 0;
  const networkNum = (ipNum & mask) >>> 0;
  const broadcastNum = (networkNum | wildcardNum) >>> 0;

  const totalHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;
  const firstHost = prefix >= 31 ? networkNum : networkNum + 1;
  const lastHost = prefix >= 31 ? broadcastNum : broadcastNum - 1;

  return {
    network: numberToIp(networkNum),
    broadcast: numberToIp(broadcastNum),
    firstHost: numberToIp(firstHost),
    lastHost: numberToIp(lastHost),
    totalHosts,
    subnetMask: numberToIp(mask),
    wildcard: numberToIp(wildcardNum),
    prefix,
  };
}

type SubnetSplit = {
  cidr: string;
  network: string;
  broadcast: string;
  hosts: number;
};

function splitSubnets(cidr: string, newPrefix: number): SubnetSplit[] | null {
  const base = parseCidr(cidr);
  if (!base || newPrefix <= base.prefix || newPrefix > 32) return null;

  const baseNetwork = ipToNumber(base.network);
  const count = Math.pow(2, newPrefix - base.prefix);
  const subnetSize = Math.pow(2, 32 - newPrefix);
  const subnets: SubnetSplit[] = [];

  for (let i = 0; i < count; i++) {
    const netNum = (baseNetwork + i * subnetSize) >>> 0;
    const bcastNum = (netNum + subnetSize - 1) >>> 0;
    const hosts = newPrefix >= 31 ? (newPrefix === 32 ? 1 : 2) : subnetSize - 2;
    subnets.push({
      cidr: `${numberToIp(netNum)}/${newPrefix}`,
      network: numberToIp(netNum),
      broadcast: numberToIp(bcastNum),
      hosts,
    });
  }

  return subnets;
}

const CidrCalculatorTool = () => {
  const [cidrInput, setCidrInput] = useState("192.168.1.0/24");
  const [result, setResult] = useState<CidrResult | null>(null);
  const [splitPrefix, setSplitPrefix] = useState(25);
  const [subnets, setSubnets] = useState<SubnetSplit[]>([]);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    setSubnets([]);
    const parsed = parseCidr(cidrInput);
    if (!parsed) {
      setError("Formato CIDR invalido. Usa el formato: 192.168.1.0/24");
      setResult(null);
      return;
    }
    setResult(parsed);
  };

  const handleSplit = () => {
    if (!result) return;
    const splits = splitSubnets(cidrInput, splitPrefix);
    if (!splits) {
      setError("El prefijo de division debe ser mayor al prefijo actual y menor o igual a 32.");
      return;
    }
    setError("");
    setSubnets(splits);
  };

  return (
    <section>
      <h1 className="public-title mb-2">Calculadora CIDR</h1>
      <p className="public-lead mb-6">Calcular rangos de red, subredes y segmentos IP.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card mb-6">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">Notacion CIDR</label>
            <ToolInput
              value={cidrInput}
              onChange={(e) => setCidrInput(e.target.value)}
              placeholder="192.168.1.0/24"
            />
          </div>
          <ToolButton onClick={handleCalculate}>
            Calcular
          </ToolButton>
        </div>

        {result && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-700/50">
                {([
                  ["Direccion de Red", result.network],
                  ["Broadcast", result.broadcast],
                  ["Primer Host", result.firstHost],
                  ["Ultimo Host", result.lastHost],
                  ["Total Hosts", result.totalHosts.toLocaleString()],
                  ["Mascara de Subred", result.subnetMask],
                  ["Wildcard", result.wildcard],
                  ["Prefijo", `/${result.prefix}`],
                ] as [string, string | number][]).map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-2 pr-4 font-medium text-text-secondary">{label}</td>
                    <td className="py-2 font-mono text-text-primary">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result && (
        <div className="public-card">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Dividir en subredes</h2>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Nuevo prefijo</label>
              <ToolInput
                className="w-24"
                type="number"
                min={result.prefix + 1}
                max={32}
                value={splitPrefix}
                onChange={(e) => setSplitPrefix(Number(e.target.value))}
              />
            </div>
            <ToolButton variant="secondary" onClick={handleSplit}>
              Dividir
            </ToolButton>
          </div>

          {subnets.length > 0 && (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-left text-text-muted">
                    <th className="pb-2 pr-4">Subred</th>
                    <th className="pb-2 pr-4">Red</th>
                    <th className="pb-2 pr-4">Broadcast</th>
                    <th className="pb-2">Hosts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {subnets.map((subnet) => (
                    <tr key={subnet.cidr}>
                      <td className="py-1.5 pr-4 font-mono text-text-primary">{subnet.cidr}</td>
                      <td className="py-1.5 pr-4 font-mono text-text-secondary">{subnet.network}</td>
                      <td className="py-1.5 pr-4 font-mono text-text-secondary">{subnet.broadcast}</td>
                      <td className="py-1.5 font-mono text-text-secondary">{subnet.hosts.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CidrCalculatorTool;
