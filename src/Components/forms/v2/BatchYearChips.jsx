import React, { useState } from "react";
import { useController } from "react-hook-form";
import { Button } from "Components/ui/button";
import { Label } from "Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "Components/ui/select";

const BatchYearChips = ({ name, control, minYear = 2024, maxYear = 2030 }) => {
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      validate: (v) =>
        (Array.isArray(v) && v.length > 0) || "Pick at least one batch year",
    },
  });

  const [from, setFrom] = useState(String(minYear));
  const [to, setTo] = useState(String(maxYear));

  const years = [];
  for (let y = minYear; y <= maxYear; y += 1) years.push(y);

  const value = Array.isArray(field.value) ? field.value : [];

  const toggle = (year) => {
    const next = value.includes(year)
      ? value.filter((y) => y !== year)
      : [...value, year].sort((a, b) => a - b);
    field.onChange(next);
  };

  const fillRange = () => {
    const start = Number(from);
    const end = Number(to);
    if (Number.isNaN(start) || Number.isNaN(end)) return;
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const merged = new Set(value);
    for (let y = lo; y <= hi; y += 1) merged.add(y);
    field.onChange([...merged].sort((a, b) => a - b));
  };

  return (
    <div className="space-y-2">
      <Label>Eligible batches</Label>
      <div className="flex flex-wrap gap-2">
        {years.map((year) => {
          const selected = value.includes(year);
          return (
            <Button
              key={year}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              onClick={() => toggle(year)}
              className="rounded-full"
            >
              {year}
            </Button>
          );
        })}
      </div>

      <div className="flex items-end gap-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={fillRange}>
          Fill range
        </Button>
      </div>

      {fieldState.error && (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export default BatchYearChips;
