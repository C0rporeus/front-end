import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import MailAuditTool from "./MailAuditTool";
import { auditMail, type MailAuditResponse } from "@/api/tools";

jest.mock("@/api/tools");
const mockAudit = jest.mocked(auditMail);

const emptySections = (): MailAuditResponse["sections"] => ({
  mx: { status: "ok", records: ["mx1.example.net (priority 10)"] },
  spf: { status: "ok", records: ["v=spf1 include:_spf.provider.test -all"], lookups: 3, includes: ["_spf.provider.test"] },
  dkim: { status: "ok", records: ["google: v=DKIM1; k=rsa; p=AAAA"], selectors: ["google"] },
  dmarc: { status: "ok", records: ["v=DMARC1; p=reject; rua=mailto:r@example.com"] },
  "mta-sts": { status: "not_found", records: null },
  "tls-rpt": { status: "not_found", records: null },
});

const response = (overrides: Partial<MailAuditResponse> = {}): MailAuditResponse => ({
  domain: "example.com",
  summary: { critical: 0, warning: 0, info: 0, ok: 0 },
  findings: [],
  sections: emptySections(),
  ...overrides,
});

const run = async (domain = "example.com") => {
  fireEvent.change(screen.getByPlaceholderText("ejemplo.com"), { target: { value: domain } });
  fireEvent.click(screen.getByRole("button", { name: /Auditar/i }));
};

describe("MailAuditTool", () => {
  afterEach(() => jest.clearAllMocks());

  test("renders the domain and optional DKIM selector inputs", () => {
    render(<MailAuditTool />);
    expect(screen.getByPlaceholderText("ejemplo.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("mail2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Auditar/i })).toBeInTheDocument();
  });

  test("a clean audit says so and shows SPF lookups against the RFC limit", async () => {
    mockAudit.mockResolvedValue(
      response({ summary: { critical: 0, warning: 0, info: 0, ok: 2 }, findings: [{ id: "spf.all_fail", section: "spf", severity: "ok", title: "El SPF termina en -all" }] }),
    );
    render(<MailAuditTool />);
    await run("Example.COM");

    await waitFor(() => {
      expect(mockAudit).toHaveBeenCalledWith("example.com", undefined);
      expect(screen.getByRole("status")).toHaveTextContent("No se encontraron problemas ni avisos");
    });
    expect(screen.getByText("El SPF termina en -all")).toBeInTheDocument();
    expect(screen.getByText(/de 10 permitidos/)).toHaveTextContent("Lookups DNS: 3 de 10 permitidos");
  });

  test("critical findings headline the result and show how to fix them", async () => {
    mockAudit.mockResolvedValue(
      response({
        summary: { critical: 1, warning: 1, info: 0, ok: 0 },
        findings: [
          { id: "spf.all_plus", section: "spf", severity: "critical", title: "+all autoriza a cualquier servidor", detail: "Permite suplantar.", remediation: "Cambia a -all." },
          { id: "dmarc.policy_none", section: "dmarc", severity: "warning", title: "p=none: solo monitoreo" },
        ],
      }),
    );
    render(<MailAuditTool />);
    await run();

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1 problema crítico que requieren corrección");
    });
    const spf = screen.getByRole("group", { name: /SPF/ });
    expect(within(spf).getByText("Crítico")).toBeInTheDocument(); // severidad en texto, no solo color
    expect(within(spf).getByText(/Cambia a -all/)).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: /DMARC/ })).getByText("Aviso")).toBeInTheDocument();
    expect(screen.getByLabelText("Resumen por severidad")).toHaveTextContent("Crítico: 1");
  });

  test("an unchecked record is reported as incomplete, never as correct", async () => {
    const sections = emptySections();
    sections.dmarc = { status: "timeout", records: null };
    mockAudit.mockResolvedValue(
      response({
        summary: { critical: 0, warning: 1, info: 0, ok: 0 },
        findings: [{ id: "dmarc.unavailable", section: "dmarc", severity: "warning", title: "No se pudo consultar este registro" }],
        sections,
      }),
    );
    render(<MailAuditTool />);
    await run();

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/Auditoría incompleta: 1 comprobación no pudieron completarse/);
    });
    expect(screen.queryByText(/No se encontraron problemas/)).not.toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: /DMARC/ })).getByText(/timeout/)).toBeInTheDocument();
  });

  test("critical problems still mention that some checks could not complete", async () => {
    mockAudit.mockResolvedValue(
      response({
        summary: { critical: 1, warning: 1, info: 0, ok: 0 },
        findings: [
          { id: "spf.cycle", section: "spf", severity: "critical", title: "Ciclo de includes" },
          { id: "dmarc.unavailable", section: "dmarc", severity: "warning", title: "No se pudo consultar este registro" },
        ],
      }),
    );
    render(<MailAuditTool />);
    await run();
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/1 comprobación sin completar/);
    });
  });

  test("sends the DKIM selector lowercased", async () => {
    mockAudit.mockResolvedValue(response());
    render(<MailAuditTool />);
    fireEvent.change(screen.getByPlaceholderText("mail2026"), { target: { value: "Mail2026" } });
    await run();
    await waitFor(() => expect(mockAudit).toHaveBeenCalledWith("example.com", "mail2026"));
  });

  test("rejects an invalid selector without calling the API", async () => {
    render(<MailAuditTool />);
    fireEvent.change(screen.getByPlaceholderText("mail2026"), { target: { value: "bad selector!" } });
    await run();
    expect(screen.getByRole("alert")).toHaveTextContent(/selector DKIM/);
    expect(mockAudit).not.toHaveBeenCalled();
  });

  test("does nothing for an empty domain", () => {
    render(<MailAuditTool />);
    fireEvent.click(screen.getByRole("button", { name: /Auditar/i }));
    expect(mockAudit).not.toHaveBeenCalled();
  });

  test("shows API errors", async () => {
    mockAudit.mockRejectedValue(new Error("boom"));
    render(<MailAuditTool />);
    await run();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  test("published records are rendered as text, never as HTML", async () => {
    const sections = emptySections();
    sections.spf = { status: "ok", records: ['v=spf1 -all <img src=x onerror="alert(1)"><script>alert(2)</script>'], lookups: 0 };
    mockAudit.mockResolvedValue(response({ sections }));
    const { container } = render(<MailAuditTool />);
    await run();
    await waitFor(() => expect(within(screen.getByRole("group", { name: /SPF/ })).getByText(/Registros publicados/)).toBeInTheDocument());
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror="alert(1)">');
  });

  test("Enter in the domain field starts the audit", async () => {
    mockAudit.mockResolvedValue(response());
    render(<MailAuditTool />);
    const input = screen.getByPlaceholderText("ejemplo.com");
    fireEvent.change(input, { target: { value: "example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(mockAudit).toHaveBeenCalledTimes(1));
  });
});
