import React from "react";
import { useFieldArray, useController } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "Components/ui/select";

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const COUNTRIES = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
];

const LocationRow = ({ name, control, index, onRemove }) => {
  const cityCtrl = useController({ name: `${name}.${index}.city`, control });
  const regionCtrl = useController({ name: `${name}.${index}.region`, control });
  const countryCtrl = useController({
    name: `${name}.${index}.country`,
    control,
    defaultValue: "IN",
  });

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">City</Label>
        <Input
          value={cityCtrl.field.value || ""}
          onChange={(e) => cityCtrl.field.onChange(e.target.value)}
          onBlur={cityCtrl.field.onBlur}
          placeholder="Bengaluru"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Region</Label>
        <Select
          value={regionCtrl.field.value || ""}
          onValueChange={(v) => regionCtrl.field.onChange(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="State / UT" />
          </SelectTrigger>
          <SelectContent>
            {INDIAN_STATES_AND_UTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Country</Label>
        <Select
          value={countryCtrl.field.value || "IN"}
          onValueChange={(v) => countryCtrl.field.onChange(v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onRemove}
        aria-label="Remove location"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

const JobLocationRepeater = ({ name, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  const addLocation = () =>
    append({ city: "", region: "", country: "IN" });

  const addRemote = () =>
    append({ city: "Remote", region: "", country: "IN" });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Locations</Label>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addRemote}>
            Remote
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={addLocation}>
            <Plus className="h-4 w-4 mr-1" />
            Add location
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No locations added</p>
      ) : (
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <LocationRow
              key={f.id}
              name={name}
              control={control}
              index={idx}
              onRemove={() => remove(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobLocationRepeater;
