"use client";
import { useEffect, useState, useRef } from "react";
const POLLING_INTERVAL = 2000; // 2 seconds

export default function JobProgress({ pending, onFinished }) {
    const [remainingJob, setRemainingJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);
    const shouldPollRef = useRef(false);
    const prevPendingRef = useRef(null);

    const fetchRemainingJob = async () => {
        try {
            const res = await fetch(`/api/get-pending-job`);
            const data = await res.json();
            if (data.error || data.remainingJobs === undefined) {
                throw new Error(data.error || "Invalid response");
            }
            setRemainingJob(data.remainingJobs);
            return data.remainingJobs > 0; // true = keep polling
        } catch (err) {
            console.error("Failed to load job status:", err);
            return true; // Keep trying on error
        } finally {
            setLoading(false);
        }
    };

    const startPolling = () => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up new polling interval
        intervalRef.current = setInterval(async () => {
            const shouldContinue = await fetchRemainingJob();
            if (!shouldContinue) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                onFinished()
            }
        }, POLLING_INTERVAL);
    };

    const resetAndStartPolling = () => {
        // Reset state
        setRemainingJob(null);
        setLoading(true);

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Initial fetch
        fetchRemainingJob().then((shouldContinue) => {
            if (shouldContinue && shouldPollRef.current) {
                startPolling();
            }
        });
    };

    useEffect(() => {
        // Only start polling if `pending` is valid
        if (pending == null || pending === 0) return;

        shouldPollRef.current = true;

        // Check if this is a new render with the same pending value
        if (prevPendingRef.current === pending) {
            // Reset and restart polling for the same pending value
            resetAndStartPolling();
        } else {
            // First time with this pending value or value changed
            prevPendingRef.current = pending;
            resetAndStartPolling();
        }

        // Cleanup on unmount
        return () => {
            shouldPollRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [pending]); // Re-run when `pending` changes

    // If no pending jobs were ever passed, don't show anything
    if (pending == null) return null;
    if (loading) return <></>;
    const completed = pending - (remainingJob ?? 0)
    // const progress = pending > 0 ? (completed / pending) * 100 : 0;

    // All jobs done
    if (completed >= pending) {
        return (<></>)
    }

    return (
        <div>
            <p>Progress: {completed} / {pending}</p>
        </div>
    );
}