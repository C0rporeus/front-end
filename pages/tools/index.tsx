import Head from "next/head";
import { useState } from "react";

import {
  decodeBase64,
  encodeBase64,
  generateSelfSignedCert,
  generateUUIDv4,
} from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";

export default function ToolsPage() {
  const [baseInput, setBaseInput] = useState("");
  const [baseOutput, setBaseOutput] = useState("");
  const [uuidOutput, setUuidOutput] = useState("");
  const [certOutput, setCertOutput] = useState("");
  const [error, setError] = useState("");

  const [commonName, setCommonName] = useState("localhost");
  const [organization, setOrganization] = useState("PortfolioTools");
  const [validDays, setValidDays] = useState(365);
  const [password, setPassword] = useState("changeit");

  const handleError = (err: unknown) => {
    setError(formatApiError(err, "Error procesando la solicitud"));
  };

  return (
    <>
      <Head>
        <title>Tools | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-10 px-4 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Herramientas para developers</h1>
        <p className="mb-8 text-sm text-gray-600">
          Utilidades ligeras para pares tecnicos: Base64, UUIDv4 y certificados autofirmados.
        </p>

        {error && (
          <p className="mb-6 p-3 rounded bg-red-100 text-red-700" role="alert">
            {error}
          </p>
        )}

        <section className="mb-10 p-4 border rounded bg-white">
          <h2 className="text-xl font-semibold mb-3">Base64 Encoder/Decoder</h2>
          <textarea
            className="w-full border rounded p-2 mb-3"
            rows={4}
            placeholder="Texto o base64"
            value={baseInput}
            onChange={(e) => setBaseInput(e.target.value)}
          />
          <div className="flex gap-2 mb-3">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={async () => {
                setError("");
                try {
                  const result = await encodeBase64(baseInput);
                  setBaseOutput(result.encoded);
                } catch (err: unknown) {
                  handleError(err);
                }
              }}
            >
              Encode
            </button>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded"
              onClick={async () => {
                setError("");
                try {
                  const result = await decodeBase64(baseInput);
                  setBaseOutput(result.decoded);
                } catch (err: unknown) {
                  handleError(err);
                }
              }}
            >
              Decode
            </button>
          </div>
          <pre className="p-3 bg-gray-100 rounded whitespace-pre-wrap break-all">{baseOutput}</pre>
        </section>

        <section className="mb-10 p-4 border rounded bg-white">
          <h2 className="text-xl font-semibold mb-3">UUID v4 Generator</h2>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded mb-3"
            onClick={async () => {
              setError("");
              try {
                const result = await generateUUIDv4();
                setUuidOutput(result.uuid);
              } catch (err: unknown) {
                handleError(err);
              }
            }}
          >
            Generar UUIDv4
          </button>
          <pre className="p-3 bg-gray-100 rounded">{uuidOutput}</pre>
        </section>

        <section className="mb-10 p-4 border rounded bg-white">
          <h2 className="text-xl font-semibold mb-3">Certificados autofirmados (.cert/.pfx)</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              className="border rounded p-2"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              placeholder="Common Name"
            />
            <input
              className="border rounded p-2"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organization"
            />
            <input
              className="border rounded p-2"
              type="number"
              value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value))}
              placeholder="Dias de validez"
            />
            <input
              className="border rounded p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password PFX"
            />
          </div>
          <button
            className="px-4 py-2 bg-purple-700 text-white rounded mb-3"
            onClick={async () => {
              setError("");
              try {
                const result = await generateSelfSignedCert({
                  commonName,
                  organization,
                  validDays,
                  password,
                });
                setCertOutput(
                  [
                    "=== CERT (PEM) ===",
                    result.certPem,
                    "=== KEY (PEM) ===",
                    result.keyPem,
                    "=== PFX (BASE64) ===",
                    result.pfxBase64,
                  ].join("\n")
                );
              } catch (err: unknown) {
                handleError(err);
              }
            }}
          >
            Generar Certificado
          </button>
          <pre className="p-3 bg-gray-100 rounded whitespace-pre-wrap break-all max-h-80 overflow-auto">
            {certOutput}
          </pre>
        </section>
      </main>
    </>
  );
}
