import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CidrCalculatorTool from "./CidrCalculatorTool";

describe("CidrCalculatorTool", () => {
  test("renders CIDR input and calculate button", () => {
    render(<CidrCalculatorTool />);
    expect(screen.getByDisplayValue("192.168.1.0/24")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Calcular/i })).toBeInTheDocument();
  });

  test("valid CIDR: calculates and shows correct network properties", () => {
    render(<CidrCalculatorTool />);
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    const rows = screen.getAllByRole("row");
    const rowText = (idx: number) => rows[idx]?.textContent ?? "";

    expect(rowText(0)).toContain("Direccion de Red");
    expect(rowText(0)).toContain("192.168.1.0");
    expect(rowText(1)).toContain("Broadcast");
    expect(rowText(1)).toContain("192.168.1.255");
    expect(rowText(2)).toContain("Primer Host");
    expect(rowText(2)).toContain("192.168.1.1");
    expect(rowText(3)).toContain("Ultimo Host");
    expect(rowText(3)).toContain("192.168.1.254");
    expect(rowText(4)).toContain("Total Hosts");
    expect(rowText(4)).toContain("254");
    expect(rowText(5)).toContain("Mascara de Subred");
    expect(rowText(5)).toContain("255.255.255.0");
    expect(rowText(7)).toContain("Prefijo");
    expect(rowText(7)).toContain("/24");
  });

  test("subnet split: shows subnets table", () => {
    render(<CidrCalculatorTool />);
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    const splitButton = screen.getByRole("button", { name: /Dividir/i });
    fireEvent.click(splitButton);

    expect(screen.getByText("192.168.1.0/25")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.128/25")).toBeInTheDocument();
  });

  test("invalid CIDR: shows error", () => {
    render(<CidrCalculatorTool />);
    const input = screen.getByDisplayValue("192.168.1.0/24");
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Formato CIDR invalido/i)).toBeInTheDocument();
  });

  test("/32 edge case: single host", () => {
    render(<CidrCalculatorTool />);
    const input = screen.getByDisplayValue("192.168.1.0/24");
    fireEvent.change(input, { target: { value: "10.0.0.1/32" } });
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    const rows = screen.getAllByRole("row");
    const hostsRow = rows.find((r) => r.textContent?.includes("Total Hosts"));
    expect(hostsRow?.textContent).toContain("1");
    expect(screen.getByText("/32")).toBeInTheDocument();
  });

  test("/31 edge case: point-to-point link (2 hosts)", () => {
    render(<CidrCalculatorTool />);
    const input = screen.getByDisplayValue("192.168.1.0/24");
    fireEvent.change(input, { target: { value: "10.0.0.0/31" } });
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    const rows = screen.getAllByRole("row");
    const hostsRow = rows.find((r) => r.textContent?.includes("Total Hosts"));
    expect(hostsRow?.textContent).toContain("2");
  });

  test("10.0.0.0/8: large network calculates correctly", () => {
    render(<CidrCalculatorTool />);
    const input = screen.getByDisplayValue("192.168.1.0/24");
    fireEvent.change(input, { target: { value: "10.0.0.0/8" } });
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    const rows = screen.getAllByRole("row");
    const networkRow = rows.find((r) => r.textContent?.includes("Direccion de Red"));
    expect(networkRow?.textContent).toContain("10.0.0.0");
    const broadcastRow = rows.find((r) => r.textContent?.includes("Broadcast"));
    expect(broadcastRow?.textContent).toContain("10.255.255.255");
    const hostsRow = rows.find((r) => r.textContent?.includes("Total Hosts"));
    expect(hostsRow?.textContent).toContain("16,777,214");
  });
});
