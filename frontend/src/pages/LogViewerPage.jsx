import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import { useParams } from 'react-router-dom';

const host = import.meta.env.VITE_HOST;

const LogsViewerPage = () => {
    const [startTime, setStartTime] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());
    const [endTime, setEndTime] = useState(new Date().toISOString());
    const { token } = useParams();
    const [logs, setLogs] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(true);
    const limit = 20;
    const formatToIST = (utcString) => {
        const date = new Date(utcString);
        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }).format(date);
    };

    const fetchLogs = async (reset = false, skp = 1) => {
        const start_time = new Date(startTime).toISOString();//new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(); // last 7 days
        const end_time = new Date(endTime).toISOString();
        // const start_time = startTime;
        // const end_time = endTime;
        console.log(skip, startTime, "  ", start_time, "  ", new Date(startTime).toISOString(), " ", endTime, " ", end_time);

        const url = new URL(`${host}/reserish/api/logs/${token}`);
        if (skp == 1)
            url.searchParams.append("skip", skip);
        url.searchParams.append("limit", limit);
        url.searchParams.append("start_time", start_time);
        url.searchParams.append("end_time", end_time);

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();

        if (data.logs.length < limit) setHasMore(false);
        console.log(data);
        if (reset) {
            setLogs([...data.logs]);
        }
        else {
            setLogs(prev => [...prev, ...data.logs]);
            setSkip(prev => prev + limit);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div style={{ width: "100vw" }}>
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">📜 Error Logs Viewer</h1>
                    {/* Time Range Filters */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="border rounded px-3 py-2"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="border rounded px-3 py-2"
                            />
                        </div>
                        <button
                            onClick={() => {

                                fetchLogs(true, 0);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 sm:mt-6 hover:bg-blue-700"
                        >
                            Fetch Logs
                        </button>
                    </div>


                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                            <span className="ml-3 text-gray-600 text-lg">Loading logs...</span>
                        </div>
                    ) : (
                        <InfiniteScroll
                            dataLength={logs.length}
                            next={fetchLogs}
                            hasMore={hasMore}
                            loader={<div className="text-center text-gray-500 py-4">Loading more logs...</div>}
                            endMessage={<p className="text-center text-gray-400 py-4">No more logs to display.</p>}
                        >
                            <div className="grid gap-6">
                                {logs.map(log => (
                                    <div key={log._id} className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
                                        <p className="text-xs text-gray-500 mb-2">{formatToIST(log.timestamp + "Z")}</p>
                                        <pre className="text-sm text-red-700 bg-gray-100 rounded-md p-3 overflow-auto max-h-60 whitespace-pre-wrap mb-1">
                                            {log?.view_name} : {log?.error_message}
                                        </pre>
                                        <pre className="text-sm text-red-700 bg-gray-100 rounded-md p-3 overflow-auto max-h-60 whitespace-pre-wrap">
                                            {log?.user}: {JSON.stringify(log?.request, null, 2)}
                                        </pre>
                                        <pre className="text-sm text-red-700 bg-gray-100 rounded-md p-3 overflow-auto max-h-60 whitespace-pre-wrap">
                                            {log?.stack_trace}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </InfiniteScroll>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogsViewerPage;
