import React, { useState } from "react";
import { useController } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "Components/ui/select";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const UNITS = [
  { value: "YEAR", label: "Per year" },
  { value: "MONTH", label: "Per month" },
  { value: "WEEK", label: "Per week" },
  { value: "DAY", label: "Per day" },
  { value: "HOUR", label: "Per hour" },
];

const indianFormatter = new Intl.NumberFormat("en-IN");

const formatNumber = (n) => {
  if (n === "" || n === null || n === undefined) return "";
  const num = Number(n);
  if (Number.isNaN(num)) return "";
  return indianFormatter.format(num);
};

const SalaryFields = ({ name, control }) => {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: { currency: "INR", min: "", max: "", unitText: "YEAR" },
    rules: {
      validate: (v) => {
        if (!v) return true;
        if (!v.min || !v.max) return true;
        return Number(v.min) <= Number(v.max) || "Min must be ≤ Max";
      },
    },
  });

  const value = field.value || {
    currency: "INR",
    min: "",
    max: "",
    unitText: "YEAR",
  };

  const [minDisplay, setMinDisplay] = useState(formatNumber(value.min));
  const [maxDisplay, setMaxDisplay] = useState(formatNumber(value.max));

  const update = (patch) => field.onChange({ ...value, ...patch });

  const handleNumberChange = (key, raw, setDisplay) => {
    const digits = raw.replace(/[^\d]/g, "");
    setDisplay(digits);
    update({ [key]: digits });
  };

  const handleNumberBlur = (key, setDisplay) => {
    const num = value[key];
    setDisplay(formatNumber(num));
    field.onBlur();
  };

  const handleNumberFocus = (key, setDisplay) => {
    setDisplay(value[key] || "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Compensation
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${name}-currency`}>Currency</Label>
          <Select
            value={value.currency || "INR"}
            onValueChange={(v) => update({ currency: v })}
          >
            <SelectTrigger id={`${name}-currency`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${name}-min`}>Min</Label>
          <Input
            id={`${name}-min`}
            inputMode="numeric"
            value={minDisplay}
            onChange={(e) => handleNumberChange("min", e.target.value, setMinDisplay)}
            onFocus={() => handleNumberFocus("min", setMinDisplay)}
            onBlur={() => handleNumberBlur("min", setMinDisplay)}
            placeholder="0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${name}-max`}>Max</Label>
          <Input
            id={`${name}-max`}
            inputMode="numeric"
            value={maxDisplay}
            onChange={(e) => handleNumberChange("max", e.target.value, setMaxDisplay)}
            onFocus={() => handleNumberFocus("max", setMaxDisplay)}
            onBlur={() => handleNumberBlur("max", setMaxDisplay)}
            placeholder="0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${name}-unit`}>Per</Label>
          <Select
            value={value.unitText || "YEAR"}
            onValueChange={(v) => update({ unitText: v })}
          >
            <SelectTrigger id={`${name}-unit`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {fieldState.error && (
          <p className="text-xs text-destructive sm:col-span-4">
            {fieldState.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SalaryFields;
