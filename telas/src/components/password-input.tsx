"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visivel ? "text" : "password"} className={`${className} pr-10`} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        tabIndex={-1}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {visivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
