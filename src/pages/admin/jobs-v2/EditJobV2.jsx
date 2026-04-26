import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";

import JobFormV2 from "./JobFormV2";
import { fetchJobV2 } from "api/v2/jobs";
import { mapJobResponseToFormValues } from "validators/v2/jobFormSchema";

const Skeleton = () => (
    <div className="px-4 lg:px-6 pt-6 pb-10 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
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
                <CardTitle>Job not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    No job exists with that id, or it may have been deleted.
                </p>
                <Button asChild variant="outline">
                    <Link to="/admin/jobs">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to jobs
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
);

const EditJobV2 = () => {
    const { id } = useParams();
    const [state, setState] = useState({ status: "loading", values: null });

    useEffect(() => {
        let cancelled = false;
        setState({ status: "loading", values: null });
        fetchJobV2(id).then((res) => {
            if (cancelled) return;
            if (res.status === 200 && res.data) {
                setState({
                    status: "ready",
                    values: mapJobResponseToFormValues(res.data),
                });
            } else if (res.status === 404) {
                setState({ status: "missing", values: null });
            } else {
                setState({ status: "error", values: null });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.status === "loading") return <Skeleton />;
    if (state.status === "missing" || state.status === "error") return <NotFound />;

    return <JobFormV2 mode="edit" jobId={id} initialValues={state.values} />;
};

export default EditJobV2;
