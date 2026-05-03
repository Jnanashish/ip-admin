import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";

import JobFormV2 from "./JobFormV2";
import { fetchJobV2 } from "api/v2/jobs";
import { mapJobResponseToFormValues } from "validators/v2/jobFormSchema";

// Backends sometimes wrap the resource in `{ data }`, `{ job }`, or
// `{ result }`. Treat the body as the job iff it has a recognisable job
// field; otherwise unwrap the first matching key, and recurse one level
// in case it's `{ data: { job: {...} } }`.
const looksLikeJob = (v) =>
    v && typeof v === "object" && !Array.isArray(v) &&
    (v.title || v._id || v.id || v.slug || v.companyName);

const unwrapJob = (body) => {
    if (!body || typeof body !== "object") return null;
    if (looksLikeJob(body)) return body;
    const candidates = [body.job, body.data, body.result];
    for (const c of candidates) {
        if (looksLikeJob(c)) return c;
        if (c && typeof c === "object") {
            const inner = c.job || c.data || c.result;
            if (looksLikeJob(inner)) return inner;
        }
    }
    return null;
};

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

const ErrorCard = ({ title, detail }) => (
    <div className="px-4 lg:px-6 pt-6 max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {detail && (
                    <p className="text-sm text-muted-foreground">{detail}</p>
                )}
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
            if (res.status === 200) {
                const job = unwrapJob(res.data);
                if (job) {
                    setState({
                        status: "ready",
                        values: mapJobResponseToFormValues(job),
                    });
                    return;
                }
                // eslint-disable-next-line no-console
                console.error(
                    "[EditJobV2] 200 OK but response shape unrecognised:",
                    res.data
                );
                setState({
                    status: "error",
                    detail:
                        "Job loaded but the response shape was unexpected. See console for details.",
                });
                return;
            }
            // eslint-disable-next-line no-console
            console.error("[EditJobV2] fetch failed:", res.status, res.error);
            if (res.status === 404) {
                setState({
                    status: "missing",
                    detail: "No job exists with that id, or it may have been deleted.",
                });
            } else if (res.status === 401 || res.status === 403) {
                setState({
                    status: "error",
                    detail: "You're not authorized to view this job. Try signing in again.",
                });
            } else if (res.status === 0) {
                setState({
                    status: "error",
                    detail:
                        res.error?.message ||
                        "Couldn't reach the backend. Check your connection and REACT_APP_BACKEND_URL.",
                });
            } else {
                setState({
                    status: "error",
                    detail:
                        (res.error && (res.error.message || JSON.stringify(res.error))) ||
                        `Backend returned HTTP ${res.status}.`,
                });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.status === "loading") return <Skeleton />;
    if (state.status === "missing")
        return <ErrorCard title="Job not found" detail={state.detail} />;
    if (state.status === "error")
        return <ErrorCard title="Couldn't load this job" detail={state.detail} />;

    return <JobFormV2 mode="edit" jobId={id} initialValues={state.values} />;
};

export default EditJobV2;
