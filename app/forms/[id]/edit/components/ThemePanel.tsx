"use client";

import React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Form } from "../types";

interface ThemePanelProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => Promise<void>;
}

export function ThemePanel({ form, onUpdate }: ThemePanelProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        Theme Settings
      </h3>

      <ColorInput
        label="Primary Color"
        value={form.primaryColor}
        onChange={(val) => onUpdate({ primaryColor: val })}
      />
      <ColorInput
        label="Background"
        value={form.backgroundColor}
        onChange={(val) => onUpdate({ backgroundColor: val })}
      />
      <ColorInput
        label="Button Color"
        value={form.buttonColor}
        onChange={(val) => onUpdate({ buttonColor: val })}
      />
      <ColorInput
        label="Text Color"
        value={form.textColor}
        onChange={(val) => onUpdate({ textColor: val })}
      />

      <div className="pt-8 border-t border-slate-200">
        <button
          onClick={() =>
            toast.success("Theme settings are saved automatically!")
          }
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Theme Changes</span>
        </button>
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div
          className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
