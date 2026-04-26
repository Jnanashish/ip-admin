import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";

import CompanyFormV2 from "./CompanyFormV2";
import { fetchCompanyV2 } from "api/v2/companies";
import { mapCompanyResponseToFormValues } from "validators/v2/companyFormSchema";

const Skeleton = () => (
    <div className="px-4 lg:px-6 pt-6 pb-10 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[0, 1, 2].map((i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const NotFound = () => (
    <div className="px-4 lg:px-6 pt-6 max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Company not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    No company exists with that id, or it may have been deleted.
                </p>
                {/* /admin/companies listing v2 lands in a later phase. */}
                <Button asChild variant="outline">
                    <Link to="/admin/companies">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to companies
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
);

const EditCompanyV2 = () => {
    const { id } = useParams();
    const [state, setState] = useState({
        status: "loading",
        values: null,
        openJobsCount: null,
    });

    useEffect(() => {
        let cancelled = false;
        setState({ status: "loading", values: null, openJobsCount: null });
        fetchCompanyV2(id).then((res) => {
            if (cancelled) return;
            if (res.status === 200 && res.data) {
                setState({
                    status: "ready",
                    values: mapCompanyResponseToFormValues(res.data),
                    openJobsCount:
                        typeof res.data?.openJobsCount === "number"
                            ? res.data.openJobsCount
                            : null,
                });
            } else if (res.status === 404) {
                setState({
                    status: "missing",
                    values: null,
                    openJobsCount: null,
                });
            } else {
                setState({
                    status: "error",
                    values: null,
                    openJobsCount: null,
                });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.status === "loading") return <Skeleton />;
    if (state.status === "missing" || state.status === "error")
        return <NotFound />;

    return (
        <CompanyFormV2
            mode="edit"
            companyId={id}
            initialValues={state.values}
            openJobsCount={state.openJobsCount}
        />
    );
};

export default EditCompanyV2;
