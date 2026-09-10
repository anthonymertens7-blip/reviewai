"use client";

import { useState } from "react";
import { ProgramForm } from "./ProgramForm";

export function CreateProgramForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        + Créer un programme
      </button>
    );
  }

  return <ProgramForm mode="create" />;
}
