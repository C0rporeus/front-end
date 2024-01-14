import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ContactForm from "./ContactForm";
import "@testing-library/jest-dom";

describe("ContactForm", () => {
  test("renders the contact form", () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument();
  });

  test("submits the form with valid inputs", () => {
    const handleSubmit = jest.fn();
    render(<ContactForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/mensaje/i), {
      target: { value: "Hola" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      "John Doe",
      "john@example.com",
      "Hola"
    );
  });

  test("does not submit the form if the email is invalid", () => {
    const handleSubmit = jest.fn();
    render(<ContactForm onSubmit={handleSubmit} />);
    const nameInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "invalid email" } });
    const mensajeInput = screen.getByLabelText(/mensaje/i) as HTMLInputElement;
    fireEvent.change(mensajeInput, { target: { value: "Hola" } });
    fireEvent.submit(screen.getByRole("button", { name: /enviar/i }));
    expect(
      screen.getByText(/introduce un correo electrónico válido/i)
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
