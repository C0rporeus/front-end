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

  test("valid CIDR: calculates and shows network properties", () => {
    render(<CidrCalculatorTool />);
    fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));

    expect(screen.getByText("192.168.1.0")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.255")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.254")).toBeInTheDocument();
    expect(screen.getByText("254")).toBeInTheDocument();
    expect(screen.getByText("255.255.255.0")).toBeInTheDocument();
    expect(screen.getByText("/24")).toBeInTheDocument();
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

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("/32")).toBeInTheDocument();
  });
});
