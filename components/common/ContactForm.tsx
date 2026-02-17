import React, { useState } from "react";
import { validationRules } from "../../interfaces/ValidationRuleContactForm";
import { ContactFormProps } from "../../interfaces/ContactFormProps";

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let isValid = true;
    const newErrors: { [key: string]: string } = {};

    for (const field in validationRules) {
      const value =
        field === "name" ? name : field === "email" ? email : message;
      if (!validationRules[field].test(value)) {
        isValid = false;
        newErrors[field] = validationRules[field].error;
      }
    }

    setErrors(newErrors);
    if (isValid) {
      onSubmit(name, email, message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="form-control"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <div id="name-error" className="error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Correo electronico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          className="form-control"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <div id="email-error" className="error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="message">Mensaje</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={500}
          className="form-control"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />

        {errors.message && <div id="message-error" className="error">{errors.message}</div>}
      </div>
      <button type="submit" className="submit-button">
        Enviar mensaje
      </button>
    </form>
  );
};

export default ContactForm;
