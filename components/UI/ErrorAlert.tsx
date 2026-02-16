type ErrorAlertProps = {
  message: string;
  className?: string;
};

const ErrorAlert = ({ message, className = "mb-4" }: ErrorAlertProps) => (
  <p
    className={`rounded-xl border border-rose-500/60 bg-rose-500/15 p-3 text-rose-200 ${className}`}
    role="alert"
  >
    {message}
  </p>
);

export default ErrorAlert;
