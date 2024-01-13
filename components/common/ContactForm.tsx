import React, { useState } from "react";

interface ContactFormProps {
  onSubmit: (name: string, email: string, message: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(name, email, message);
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label>Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Mensaje:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="form-control"
        />
      </div>
      <button type="submit" className="submit-button">
        Enviar
      </button>
    </form>
  );
};

export default ContactForm;
