import React, { useState } from "react";
import { validationRules } from "../../interfaces/ValidationRuleContactForm";
import { ContactFormProps } from "../../interfaces/ContactFormProps";
import { log } from "console";

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
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
        console.log(
          `Error en validacion ${field}: ${validationRules[field].error}`
        );
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    if (isValid) {
      onSubmit(name, email, message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Nombre:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-control"
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-control"
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="message">Mensaje:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="form-control"
        />

        {errors.message && <div className="error">{errors.message}</div>}
      </div>
      <button type="submit" className="submit-button">
        Enviar
      </button>
    </form>
  );
};

export default ContactForm;
