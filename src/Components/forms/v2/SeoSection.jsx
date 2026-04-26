import React, { useState } from "react";
import { useController } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "Components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "Components/ui/collapsible";
import { Input } from "Components/ui/input";
import { Textarea } from "Components/ui/textarea";
import { Label } from "Components/ui/label";
import { Button } from "Components/ui/button";
import { cn } from "lib/utils";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const META_DESC_TRIM = 155;

export const makeMetaTitle = (autoFillFrom = {}) => {
  const { title, companyName } = autoFillFrom;
  if (!title || !companyName) return "";
  return `${title} at ${companyName} — CareersAt.Tech`;
};

export const makeMetaDescription = (autoFillFrom = {}) => {
  const { title, companyName, batch, location } = autoFillFrom;
  if (!title || !companyName) return "";
  const batchStr =
    Array.isArray(batch) && batch.length ? batch.join(", ") : "any";
  const cityStr = location?.city || "various locations";
  const text = `Apply for ${title} at ${companyName}. Eligible batch: ${batchStr}. Location: ${cityStr}.`;
  return text.length > META_DESC_TRIM ? text.slice(0, META_DESC_TRIM) : text;
};

const isValidUrl = (s) => {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
};

const SeoSection = ({
  name,
  control,
  autoFillFrom = {},
  generateMetaTitle,
  generateMetaDescription,
}) => {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const titleCtrl = useController({ name: `${name}.metaTitle`, control });
  const descCtrl = useController({ name: `${name}.metaDescription`, control });
  const ogCtrl = useController({ name: `${name}.ogImage`, control });

  const titleGen = generateMetaTitle || makeMetaTitle;
  const descGen = generateMetaDescription || makeMetaDescription;

  const titleVal = titleCtrl.field.value || "";
  const descVal = descCtrl.field.value || "";
  const ogVal = ogCtrl.field.value || "";

  const titleOver = titleVal.length > META_TITLE_MAX;
  const descOver = descVal.length > META_DESC_MAX;

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between p-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                SEO &amp; Meta
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Optional — auto-filled from form values
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                open && "rotate-180"
              )}
            />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${name}-metaTitle`}>Meta title</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => titleCtrl.field.onChange(titleGen(autoFillFrom))}
                >
                  Reset to auto-generated
                </Button>
              </div>
              <Input
                id={`${name}-metaTitle`}
                value={titleVal}
                onChange={(e) => titleCtrl.field.onChange(e.target.value)}
                onBlur={titleCtrl.field.onBlur}
                className={cn(titleOver && "border-destructive")}
              />
              <span
                className={cn(
                  "text-xs",
                  titleOver ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {titleVal.length}/{META_TITLE_MAX}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${name}-metaDescription`}>Meta description</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    descCtrl.field.onChange(descGen(autoFillFrom))
                  }
                >
                  Reset to auto-generated
                </Button>
              </div>
              <Textarea
                id={`${name}-metaDescription`}
                value={descVal}
                onChange={(e) => descCtrl.field.onChange(e.target.value)}
                onBlur={descCtrl.field.onBlur}
                rows={3}
                className={cn(descOver && "border-destructive")}
              />
              <span
                className={cn(
                  "text-xs",
                  descOver ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {descVal.length}/{META_DESC_MAX}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${name}-ogImage`}>OG image URL</Label>
              <Input
                id={`${name}-ogImage`}
                value={ogVal}
                onChange={(e) => {
                  setImgError(false);
                  ogCtrl.field.onChange(e.target.value);
                }}
                onBlur={ogCtrl.field.onBlur}
                placeholder="https://..."
              />
              {isValidUrl(ogVal) && !imgError && (
                <img
                  src={ogVal}
                  alt="OG preview"
                  className="h-20 w-auto rounded-md border"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SeoSection;
