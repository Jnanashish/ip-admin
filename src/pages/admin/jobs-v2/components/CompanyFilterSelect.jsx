import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "Components/ui/popover";
import { ScrollArea } from "Components/ui/scroll-area";
import { cn } from "lib/utils";
import { listCompaniesV2 } from "api/v2/companies";

const getId = (c) => c?.id || c?._id || "";
const getName = (c) => c?.name || c?.companyName || "";

const CompanyFilterSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open || loaded) return;
        let cancelled = false;
        setLoading(true);
        listCompaniesV2({ limit: 100 })
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res?.data)
                    ? res.data
                    : res?.data?.items || res?.data?.data || [];
                setCompanies(list);
                setLoaded(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, loaded]);

    const filtered = useMemo(() => {
        if (!search) return companies;
        const q = search.toLowerCase();
        return companies.filter((c) => getName(c).toLowerCase().includes(q));
    }, [search, companies]);

    const selected = useMemo(
        () => companies.find((c) => getId(c) === value),
        [companies, value]
    );

    const triggerLabel =
        !value || value === "all"
            ? "All companies"
            : selected
              ? getName(selected)
              : "Selected";

    const handleSelect = (id) => {
        onChange(id || "all");
        setOpen(false);
        setSearch("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full sm:w-56 justify-between font-normal",
                        (!value || value === "all") && "text-muted-foreground"
                    )}
                >
                    <span className="truncate">{triggerLabel}</span>
                    <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 w-[--radix-popover-trigger-width]"
                align="start"
            >
                <div className="flex items-center gap-2 px-3 py-2 border-b">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search company"
                        className="h-8 border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                </div>
                <ScrollArea className="max-h-72">
                    <ul className="py-1">
                        <li>
                            <button
                                type="button"
                                onClick={() => handleSelect("all")}
                                className={cn(
                                    "flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground",
                                    (!value || value === "all") && "bg-accent"
                                )}
                            >
                                <span>All companies</span>
                                {(!value || value === "all") && (
                                    <Check className="h-4 w-4 shrink-0" />
                                )}
                            </button>
                        </li>
                        {loading && (
                            <li className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading…
                            </li>
                        )}
                        {!loading && filtered.length === 0 && loaded && (
                            <li className="px-3 py-4 text-sm text-muted-foreground">
                                No companies found.
                            </li>
                        )}
                        {!loading &&
                            filtered.map((c) => {
                                const id = getId(c);
                                const isSelected = id === value;
                                return (
                                    <li key={id || getName(c)}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(id)}
                                            className={cn(
                                                "flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent"
                                            )}
                                        >
                                            <span className="truncate">
                                                {getName(c)}
                                            </span>
                                            {isSelected && (
                                                <Check className="h-4 w-4 shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default CompanyFilterSelect;
