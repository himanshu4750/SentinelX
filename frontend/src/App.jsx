import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ITEMS_PER_PAGE = 10;

function App() {

    // ==========================================
    // MAIN STATE
    // ==========================================

    const [dashboard, setDashboard] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [events, setEvents] = useState([]);

    const [selectedIncident, setSelectedIncident] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusUpdating, setStatusUpdating] = useState(false);


    // ==========================================
    // INCIDENT NOTES
    // ==========================================

    const [incidentNotes, setIncidentNotes] = useState([]);
    const [newIncidentNote, setNewIncidentNote] = useState("");
    const [incidentNotesLoading, setIncidentNotesLoading] = useState(false);
    const [incidentNoteSaving, setIncidentNoteSaving] = useState(false);


    // ==========================================
    // INCIDENT STATUS HISTORY
    // ==========================================

    const [incidentHistory, setIncidentHistory] = useState([]);
    const [incidentHistoryLoading, setIncidentHistoryLoading] =
        useState(false);


    // ==========================================
    // ALERT INVESTIGATION
    // ==========================================

    const [selectedAlert, setSelectedAlert] = useState(null);

    const [
        selectedAlertHistory,
        setSelectedAlertHistory
    ] = useState([]);

    const [historyLoading, setHistoryLoading] = useState(false);


    // ==========================================
    // ALERT NOTES
    // ==========================================

    const [alertNotes, setAlertNotes] = useState([]);
    const [newAlertNote, setNewAlertNote] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteSaving, setNoteSaving] = useState(false);


    // ==========================================
    // ALERT FILTERS
    // ==========================================

    const [severityFilter, setSeverityFilter] = useState("ALL");
    const [alertStatusFilter, setAlertStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");


    // ==========================================
    // INCIDENT FILTERS
    // ==========================================

    const [
        incidentStatusFilter,
        setIncidentStatusFilter
    ] = useState("ALL");

    const [
        incidentSeverityFilter,
        setIncidentSeverityFilter
    ] = useState("ALL");

    const [
        incidentSort,
        setIncidentSort
    ] = useState("RISK_HIGH_TO_LOW");


    // ==========================================
    // PAGINATION
    // ==========================================

    const [alertPage, setAlertPage] = useState(1);
    const [incidentPage, setIncidentPage] = useState(1);


    // ==========================================
    // HELPER
    // ==========================================

    const extractArray = (response, key) => {

        if (Array.isArray(response.data)) {
            return response.data;
        }

        if (Array.isArray(response.data?.[key])) {
            return response.data[key];
        }

        if (Array.isArray(response.data?.data)) {
            return response.data.data;
        }

        return [];
    };


    // ==========================================
    // LOAD DATA
    // ==========================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                dashboardResponse,
                alertsResponse,
                incidentsResponse,
                eventsResponse
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/dashboard`),
                axios.get(`${API_BASE_URL}/alerts`),
                axios.get(`${API_BASE_URL}/incidents`),
                axios.get(`${API_BASE_URL}/events`)
            ]);

            setDashboard(
                dashboardResponse.data.dashboard ||
                dashboardResponse.data.data ||
                dashboardResponse.data
            );

            setAlerts(
                extractArray(
                    alertsResponse,
                    "alerts"
                )
            );

            setIncidents(
                extractArray(
                    incidentsResponse,
                    "incidents"
                )
            );

            setEvents(
                extractArray(
                    eventsResponse,
                    "events"
                )
            );

        } catch (err) {

            console.error(
                "Unable to load SentinelX:",
                err
            );

            setError(
                "Unable to connect to SentinelX backend."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // REFRESH DATA
    // ==========================================

    const refreshData = async () => {

        try {

            const [
                dashboardResponse,
                alertsResponse,
                incidentsResponse,
                eventsResponse
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/dashboard`),
                axios.get(`${API_BASE_URL}/alerts`),
                axios.get(`${API_BASE_URL}/incidents`),
                axios.get(`${API_BASE_URL}/events`)
            ]);

            setDashboard(
                dashboardResponse.data.dashboard ||
                dashboardResponse.data.data ||
                dashboardResponse.data
            );

            setAlerts(
                extractArray(
                    alertsResponse,
                    "alerts"
                )
            );

            setIncidents(
                extractArray(
                    incidentsResponse,
                    "incidents"
                )
            );

            setEvents(
                extractArray(
                    eventsResponse,
                    "events"
                )
            );

        } catch (err) {

            console.error(
                "Auto refresh failed:",
                err
            );
        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadData();

        const interval =
            setInterval(() => {
                refreshData();
            }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, []);


    // ==========================================
    // RESET ALERT PAGE
    // ==========================================

    useEffect(() => {

        setAlertPage(1);

    }, [
        searchTerm,
        severityFilter,
        alertStatusFilter
    ]);


    // ==========================================
    // RESET INCIDENT PAGE
    // ==========================================

    useEffect(() => {

        setIncidentPage(1);

    }, [
        incidentStatusFilter,
        incidentSeverityFilter,
        incidentSort
    ]);


    // ==========================================
    // UPDATE ALERT STATUS
    // ==========================================

    const updateAlertStatus = async (
        alertId,
        status
    ) => {

        try {

            const response =
                await axios.patch(
                    `${API_BASE_URL}/alerts/${alertId}/status`,
                    {
                        status
                    }
                );

            const updatedAlert =
                response.data.alert ||
                response.data.data ||
                response.data;

            setAlerts(
                (previousAlerts) =>
                    previousAlerts.map(
                        (alertItem) =>
                            alertItem.id === alertId
                                ? {
                                    ...alertItem,
                                    ...updatedAlert,
                                    status:
                                        updatedAlert.status ||
                                        status
                                }
                                : alertItem
                    )
            );

            if (
                selectedAlert &&
                selectedAlert.id === alertId
            ) {

                setSelectedAlert(
                    (previous) => ({
                        ...previous,
                        ...updatedAlert,
                        status:
                            updatedAlert.status ||
                            status
                    })
                );
            }

            await refreshData();

            if (
                selectedAlert &&
                selectedAlert.id === alertId
            ) {
                await loadAlertInvestigationData(
                    alertId
                );
            }

        } catch (err) {

            console.error(
                "Unable to update alert status:",
                err
            );

            window.alert(
                err.response?.data?.message ||
                "Unable to update alert status."
            );
        }
    };


    // ==========================================
    // LOAD ALERT INVESTIGATION
    // ==========================================

    const loadAlertInvestigationData =
        async (alertId) => {

            try {

                setHistoryLoading(true);
                setNotesLoading(true);

                const [
                    historyResponse,
                    notesResponse
                ] = await Promise.all([

                    axios.get(
                        `${API_BASE_URL}/alerts/${alertId}/history`
                    ),

                    axios.get(
                        `${API_BASE_URL}/alerts/${alertId}/notes`
                    )
                ]);

                const history =
                    historyResponse.data.history ||
                    historyResponse.data.data ||
                    [];

                const notes =
                    notesResponse.data.notes ||
                    notesResponse.data.data ||
                    [];

                setSelectedAlertHistory(
                    Array.isArray(history)
                        ? history
                        : []
                );

                setAlertNotes(
                    Array.isArray(notes)
                        ? notes
                        : []
                );

            } catch (err) {

                console.error(
                    "Unable to load alert investigation data:",
                    err
                );

            } finally {

                setHistoryLoading(false);
                setNotesLoading(false);
            }
        };


    // ==========================================
    // OPEN ALERT
    // ==========================================

    const openAlertHistory = async (
        alertItem
    ) => {

        setSelectedAlert(alertItem);
        setSelectedAlertHistory([]);
        setAlertNotes([]);
        setNewAlertNote("");

        await loadAlertInvestigationData(
            alertItem.id
        );
    };


    // ==========================================
    // ADD ALERT NOTE
    // ==========================================

    const addNoteToAlert = async () => {

        if (!selectedAlert) {
            return;
        }

        const cleanNote =
            newAlertNote.trim();

        if (!cleanNote) {

            window.alert(
                "Please enter a note."
            );

            return;
        }

        try {

            setNoteSaving(true);

            const response =
                await axios.post(
                    `${API_BASE_URL}/alerts/${selectedAlert.id}/notes`,
                    {
                        note: cleanNote
                    }
                );

            const savedNote =
                response.data.note ||
                response.data.data;

            if (savedNote) {

                setAlertNotes(
                    (previousNotes) => [
                        savedNote,
                        ...previousNotes
                    ]
                );

            } else {

                await loadAlertInvestigationData(
                    selectedAlert.id
                );
            }

            setNewAlertNote("");

        } catch (err) {

            console.error(
                "Unable to save alert note:",
                err
            );

            window.alert(
                err.response?.data?.message ||
                "Unable to save alert note."
            );

        } finally {

            setNoteSaving(false);
        }
    };


    // ==========================================
    // OPEN INCIDENT
    // ==========================================

    const openIncident = async (
        incidentId
    ) => {

        try {

            setIncidentNotesLoading(true);
            setIncidentHistoryLoading(true);

            setIncidentNotes([]);
            setIncidentHistory([]);
            setNewIncidentNote("");

            const [
                incidentResponse,
                notesResponse,
                historyResponse
            ] = await Promise.all([

                axios.get(
                    `${API_BASE_URL}/incidents/${incidentId}`
                ),

                axios.get(
                    `${API_BASE_URL}/incidents/${incidentId}/notes`
                ),

                axios.get(
                    `${API_BASE_URL}/incidents/${incidentId}/history`
                )
            ]);

            const incident =
                incidentResponse.data.incident ||
                incidentResponse.data.data ||
                incidentResponse.data;

            const notes =
                notesResponse.data.notes ||
                notesResponse.data.data ||
                [];

            const history =
                historyResponse.data.history ||
                historyResponse.data.data ||
                [];

            setSelectedIncident(
                incident
            );

            setIncidentNotes(
                Array.isArray(notes)
                    ? notes
                    : []
            );

            setIncidentHistory(
                Array.isArray(history)
                    ? history
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load incident investigation:",
                err
            );

            window.alert(
                "Unable to load incident investigation."
            );

        } finally {

            setIncidentNotesLoading(false);
            setIncidentHistoryLoading(false);
        }
    };


    // ==========================================
    // ADD INCIDENT NOTE
    // ==========================================

    const addIncidentNote = async () => {

        if (!selectedIncident) {
            return;
        }

        const cleanNote =
            newIncidentNote.trim();

        if (!cleanNote) {

            window.alert(
                "Please enter an incident note."
            );

            return;
        }

        try {

            setIncidentNoteSaving(true);

            const response =
                await axios.post(
                    `${API_BASE_URL}/incidents/${selectedIncident.incident_id}/notes`,
                    {
                        note: cleanNote
                    }
                );

            const savedNote =
                response.data.note ||
                response.data.data;

            if (savedNote) {

                setIncidentNotes(
                    (previousNotes) => [
                        savedNote,
                        ...previousNotes
                    ]
                );

            }

            setNewIncidentNote("");

        } catch (err) {

            console.error(
                "Unable to save incident note:",
                err
            );

            window.alert(
                err.response?.data?.message ||
                "Unable to save incident note."
            );

        } finally {

            setIncidentNoteSaving(false);
        }
    };


    // ==========================================
    // UPDATE INCIDENT STATUS
    // ==========================================

    const updateIncidentStatus = async (
        status
    ) => {

        if (!selectedIncident) {
            return;
        }

        try {

            setStatusUpdating(true);

            const incidentId =
                selectedIncident.incident_id;

            const response =
                await axios.patch(
                    `${API_BASE_URL}/incidents/${incidentId}/status`,
                    {
                        status
                    }
                );

            const updatedIncident =
                response.data.incident ||
                response.data.data ||
                response.data;

            setSelectedIncident(
                (previous) => ({
                    ...previous,
                    ...updatedIncident,
                    status:
                        updatedIncident.status ||
                        status
                })
            );

            setIncidents(
                (previousIncidents) =>
                    previousIncidents.map(
                        (incident) =>
                            incident.incident_id ===
                            incidentId

                                ? {
                                    ...incident,
                                    ...updatedIncident,
                                    status:
                                        updatedIncident.status ||
                                        status
                                }

                                : incident
                    )
            );

            await refreshData();

            // Refresh status history
            const historyResponse =
                await axios.get(
                    `${API_BASE_URL}/incidents/${incidentId}/history`
                );

            const updatedHistory =
                historyResponse.data.history ||
                historyResponse.data.data ||
                [];

            setIncidentHistory(
                Array.isArray(updatedHistory)
                    ? updatedHistory
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to update incident status:",
                err
            );

            window.alert(
                err.response?.data?.message ||
                "Unable to update incident status."
            );

        } finally {

            setStatusUpdating(false);
        }
    };


    // ==========================================
    // CHART DATA
    // ==========================================

    const severityData = [
        {
            name: "LOW",
            value:
                alerts.filter(
                    (alert) =>
                        alert.severity === "LOW"
                ).length
        },
        {
            name: "MEDIUM",
            value:
                alerts.filter(
                    (alert) =>
                        alert.severity === "MEDIUM"
                ).length
        },
        {
            name: "HIGH",
            value:
                alerts.filter(
                    (alert) =>
                        alert.severity === "HIGH"
                ).length
        },
        {
            name: "CRITICAL",
            value:
                alerts.filter(
                    (alert) =>
                        alert.severity === "CRITICAL"
                ).length
        }
    ];


    const alertsGroupedByTime = {};

    alerts.forEach((alert) => {

        if (!alert.timestamp) {
            return;
        }

        const date =
            new Date(alert.timestamp);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return;
        }

        const time =
            date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        alertsGroupedByTime[time] =
            (alertsGroupedByTime[time] || 0) + 1;
    });


    const alertsOverTime =
        Object.entries(
            alertsGroupedByTime
        ).map(
            ([time, count]) => ({
                time,
                count
            })
        );


    // ==========================================
    // FILTER ALERTS
    // ==========================================

    const filteredAlerts =
        alerts.filter((alert) => {

            const matchesSeverity =
                severityFilter === "ALL" ||
                alert.severity ===
                severityFilter;

            const matchesStatus =
                alertStatusFilter === "ALL" ||
                (alert.status || "NEW") ===
                alertStatusFilter;

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                (alert.username || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (alert.source_ip || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (alert.title || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (alert.alert_type || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (alert.mitre_technique || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (alert.mitre_technique_id || "")
                    .toLowerCase()
                    .includes(search);

            return (
                matchesSeverity &&
                matchesStatus &&
                matchesSearch
            );
        });


    // ==========================================
    // FILTER INCIDENTS
    // ==========================================

    const filteredIncidents =
        incidents
            .filter((incident) => {

                const matchesStatus =
                    incidentStatusFilter === "ALL" ||
                    incident.status ===
                    incidentStatusFilter;

                const matchesSeverity =
                    incidentSeverityFilter === "ALL" ||
                    incident.severity ===
                    incidentSeverityFilter;

                return (
                    matchesStatus &&
                    matchesSeverity
                );
            })
            .sort((a, b) => {

                const riskA =
                    Number(
                        a.risk_score || 0
                    );

                const riskB =
                    Number(
                        b.risk_score || 0
                    );

                if (
                    incidentSort ===
                    "RISK_HIGH_TO_LOW"
                ) {
                    return riskB - riskA;
                }

                return riskA - riskB;
            });


    // ==========================================
    // PAGINATION
    // ==========================================

    const alertTotalPages =
        Math.max(
            1,
            Math.ceil(
                filteredAlerts.length /
                ITEMS_PER_PAGE
            )
        );

    const incidentTotalPages =
        Math.max(
            1,
            Math.ceil(
                filteredIncidents.length /
                ITEMS_PER_PAGE
            )
        );


    const paginatedAlerts =
        filteredAlerts.slice(
            (alertPage - 1) *
            ITEMS_PER_PAGE,

            alertPage *
            ITEMS_PER_PAGE
        );


    const paginatedIncidents =
        filteredIncidents.slice(
            (incidentPage - 1) *
            ITEMS_PER_PAGE,

            incidentPage *
            ITEMS_PER_PAGE
        );


    useEffect(() => {

        if (
            alertPage >
            alertTotalPages
        ) {
            setAlertPage(
                alertTotalPages
            );
        }

    }, [
        alertPage,
        alertTotalPages
    ]);


    useEffect(() => {

        if (
            incidentPage >
            incidentTotalPages
        ) {
            setIncidentPage(
                incidentTotalPages
            );
        }

    }, [
        incidentPage,
        incidentTotalPages
    ]);


    // ==========================================
    // LOADING / ERROR
    // ==========================================

    if (loading) {

        return (
            <div className="loading">
                Loading SentinelX...
            </div>
        );
    }


    if (error) {

        return (

            <div className="error-container">

                <h2>
                    SentinelX
                </h2>

                <p>
                    {error}
                </p>

                <button onClick={loadData}>
                    Retry
                </button>

            </div>
        );
    }


    return (

        <div className="app">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="header">

                <div>

                    <h1>
                        SentinelX
                    </h1>

                    <p>
                        Security Operations Dashboard
                    </p>

                </div>

                <div className="live-indicator">
                    ● LIVE
                </div>

            </header>


            {/* ==================================
                DASHBOARD CARDS
            ================================== */}

            <section className="dashboard-cards">

                <div className="card">

                    <h3>
                        Total Events
                    </h3>

                    <p>
                        {
                            dashboard?.totalEvents ??
                            events.length
                        }
                    </p>

                </div>


                <div className="card">

                    <h3>
                        Total Alerts
                    </h3>

                    <p>
                        {
                            dashboard?.totalAlerts ??
                            alerts.length
                        }
                    </p>

                </div>


                <div className="card">

                    <h3>
                        Total Incidents
                    </h3>

                    <p>
                        {
                            dashboard?.totalIncidents ??
                            incidents.length
                        }
                    </p>

                </div>


                <div className="card">

                    <h3>
                        Critical Alerts
                    </h3>

                    <p>
                        {
                            dashboard?.criticalAlerts ??
                            alerts.filter(
                                (alert) =>
                                    alert.severity ===
                                    "CRITICAL"
                            ).length
                        }
                    </p>

                </div>


                <div className="card">

                    <h3>
                        Open Incidents
                    </h3>

                    <p>
                        {
                            dashboard?.openIncidents ??
                            incidents.filter(
                                (incident) =>
                                    incident.status ===
                                    "OPEN"
                            ).length
                        }
                    </p>

                </div>

            </section>


            {/* ==================================
                SEVERITY CHART
            ================================== */}

            <section className="chart-section">

                <h2>
                    Alert Severity Distribution
                </h2>

                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <PieChart>

                            <Pie
                                data={severityData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            />

                            <Tooltip />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </section>


            {/* ==================================
                ALERTS OVER TIME
            ================================== */}

            <section className="chart-section">

                <h2>
                    Alerts Over Time
                </h2>

                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={alertsOverTime}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="time"
                            />

                            <YAxis
                                allowDecimals={false}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="count"
                                strokeWidth={2}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </section>


            {/* ==================================
                ALERTS
            ================================== */}

            <section className="section">

                <div className="section-header">

                    <h2>
                        Recent Alerts
                    </h2>

                    <span className="result-count">
                        {filteredAlerts.length} alerts
                    </span>

                </div>


                <div className="alert-filters">

                    <input
                        type="text"
                        placeholder="Search user, IP, alert or MITRE..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />


                    <select
                        value={severityFilter}
                        onChange={(e) =>
                            setSeverityFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Severities
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>


                    <select
                        value={alertStatusFilter}
                        onChange={(e) =>
                            setAlertStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="NEW">
                            New
                        </option>

                        <option value="ACKNOWLEDGED">
                            Acknowledged
                        </option>

                        <option value="CLOSED">
                            Closed
                        </option>

                    </select>


                    <button
                        className="clear-filter-button"
                        onClick={() => {

                            setSearchTerm("");
                            setSeverityFilter("ALL");
                            setAlertStatusFilter("ALL");
                        }}
                    >
                        Clear Filters
                    </button>

                </div>


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Alert</th>
                                <th>User</th>
                                <th>Source IP</th>
                                <th>Severity</th>
                                <th>Risk</th>
                                <th>MITRE</th>
                                <th>Status</th>
                                <th>Action</th>
                                <th>Time</th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                paginatedAlerts.length === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="10"
                                                className="empty-table"
                                            >
                                                No alerts found.
                                            </td>

                                        </tr>

                                    )

                                    : paginatedAlerts.map(
                                        (alertItem) => (

                                            <tr
                                                key={
                                                    alertItem.id
                                                }
                                            >

                                                <td>
                                                    {alertItem.id}
                                                </td>

                                                <td>
                                                    {
                                                        alertItem.title ||
                                                        alertItem.alert_type
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        alertItem.username ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        alertItem.source_ip ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `severity ${alertItem.severity?.toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            alertItem.severity
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        alertItem.risk_score
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        alertItem.mitre_technique
                                                            ? (
                                                                <>
                                                                    {
                                                                        alertItem.mitre_technique
                                                                    }

                                                                    <br />

                                                                    <small>
                                                                        {
                                                                            alertItem.mitre_technique_id
                                                                        }
                                                                    </small>
                                                                </>
                                                            )
                                                            : "-"
                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `alert-status ${(alertItem.status || "NEW").toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            alertItem.status ||
                                                            "NEW"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="alert-actions">

                                                        {
                                                            (alertItem.status || "NEW") ===
                                                            "NEW"

                                                            && (

                                                                <button
                                                                    className="ack-button"
                                                                    onClick={() =>
                                                                        updateAlertStatus(
                                                                            alertItem.id,
                                                                            "ACKNOWLEDGED"
                                                                        )
                                                                    }
                                                                >
                                                                    Acknowledge
                                                                </button>

                                                            )
                                                        }


                                                        {
                                                            (alertItem.status || "NEW") !==
                                                            "CLOSED"

                                                            && (

                                                                <button
                                                                    className="close-alert-button"
                                                                    onClick={() =>
                                                                        updateAlertStatus(
                                                                            alertItem.id,
                                                                            "CLOSED"
                                                                        )
                                                                    }
                                                                >
                                                                    Close
                                                                </button>

                                                            )
                                                        }


                                                        <button
                                                            className="history-button"
                                                            onClick={() =>
                                                                openAlertHistory(
                                                                    alertItem
                                                                )
                                                            }
                                                        >
                                                            View History
                                                        </button>

                                                    </div>

                                                </td>

                                                <td>

                                                    {
                                                        alertItem.timestamp

                                                            ? new Date(
                                                                alertItem.timestamp
                                                            ).toLocaleString()

                                                            : "-"
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div className="pagination">

                    <button
                        disabled={
                            alertPage === 1
                        }
                        onClick={() =>
                            setAlertPage(
                                (page) =>
                                    page - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {alertPage} of {alertTotalPages}
                    </span>

                    <button
                        disabled={
                            alertPage ===
                            alertTotalPages
                        }
                        onClick={() =>
                            setAlertPage(
                                (page) =>
                                    page + 1
                            )
                        }
                    >
                        Next
                    </button>

                </div>

            </section>


            {/* ==================================
                ALERT INVESTIGATION
            ================================== */}

            {
                selectedAlert && (

                    <section className="section alert-history-panel">

                        <div className="section-header">

                            <div>

                                <h2>
                                    Alert Investigation
                                </h2>

                                <p className="history-subtitle">
                                    Alert #{selectedAlert.id}
                                </p>

                            </div>


                            <button
                                className="close-button"
                                onClick={() => {

                                    setSelectedAlert(null);
                                    setSelectedAlertHistory([]);
                                    setAlertNotes([]);
                                    setNewAlertNote("");
                                }}
                            >
                                Close
                            </button>

                        </div>


                        <div className="alert-history-summary">

                            <div>
                                <span>Status</span>

                                <strong>
                                    {
                                        selectedAlert.status ||
                                        "NEW"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Severity</span>

                                <strong>
                                    {
                                        selectedAlert.severity ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Risk</span>

                                <strong>
                                    {
                                        selectedAlert.risk_score ??
                                        "-"
                                    }
                                </strong>
                            </div>

                        </div>


                        {/* ALERT HISTORY */}

                        <div className="alert-history-section">

                            <h3>
                                Status History
                            </h3>

                            {
                                historyLoading

                                    ? (
                                        <p>
                                            Loading history...
                                        </p>
                                    )

                                    : selectedAlertHistory.length === 0

                                        ? (
                                            <p>
                                                No status changes recorded.
                                            </p>
                                        )

                                        : (

                                            <div className="alert-history-list">

                                                {
                                                    selectedAlertHistory.map(
                                                        (historyItem) => (

                                                            <div
                                                                className="alert-history-item"
                                                                key={historyItem.id}
                                                            >

                                                                <div className="history-marker">
                                                                    ●
                                                                </div>

                                                                <div className="history-content">

                                                                    <strong>

                                                                        {
                                                                            historyItem.old_status ||
                                                                            "NEW"
                                                                        }

                                                                        {" → "}

                                                                        {
                                                                            historyItem.new_status
                                                                        }

                                                                    </strong>

                                                                    <span>

                                                                        {
                                                                            historyItem.changed_at

                                                                                ? new Date(
                                                                                    historyItem.changed_at
                                                                                ).toLocaleString()

                                                                                : "-"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>
                                        )
                            }

                        </div>


                        {/* ALERT NOTES */}

                        <div className="alert-notes-section">

                            <h3>
                                Analyst Notes
                            </h3>

                            <div className="note-form">

                                <textarea
                                    placeholder="Write an investigation note..."
                                    value={newAlertNote}
                                    maxLength={2000}
                                    onChange={(e) =>
                                        setNewAlertNote(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    onClick={
                                        addNoteToAlert
                                    }
                                    disabled={
                                        noteSaving ||
                                        !newAlertNote.trim()
                                    }
                                >
                                    {
                                        noteSaving
                                            ? "Saving..."
                                            : "Add Note"
                                    }
                                </button>

                            </div>


                            {
                                notesLoading

                                    ? (
                                        <p>
                                            Loading notes...
                                        </p>
                                    )

                                    : alertNotes.length === 0

                                        ? (
                                            <p>
                                                No analyst notes yet.
                                            </p>
                                        )

                                        : (

                                            <div className="alert-notes-list">

                                                {
                                                    alertNotes.map(
                                                        (noteItem) => (

                                                            <div
                                                                className="alert-note"
                                                                key={noteItem.id}
                                                            >

                                                                <p>
                                                                    {
                                                                        noteItem.note
                                                                    }
                                                                </p>

                                                                <span>

                                                                    {
                                                                        noteItem.created_at

                                                                            ? new Date(
                                                                                noteItem.created_at
                                                                            ).toLocaleString()

                                                                            : "-"
                                                                    }

                                                                </span>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>
                                        )
                            }

                        </div>

                    </section>
                )
            }


            {/* ==================================
                INCIDENTS
            ================================== */}

            <section className="section">

                <div className="section-header">

                    <h2>
                        Recent Incidents
                    </h2>

                    <span className="result-count">
                        {filteredIncidents.length} incidents
                    </span>

                </div>


                <div className="incident-filters">

                    <select
                        value={incidentStatusFilter}
                        onChange={(e) =>
                            setIncidentStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="OPEN">
                            Open
                        </option>

                        <option value="INVESTIGATING">
                            Investigating
                        </option>

                        <option value="RESOLVED">
                            Resolved
                        </option>

                    </select>


                    <select
                        value={incidentSeverityFilter}
                        onChange={(e) =>
                            setIncidentSeverityFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Severities
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>


                    <select
                        value={incidentSort}
                        onChange={(e) =>
                            setIncidentSort(
                                e.target.value
                            )
                        }
                    >

                        <option value="RISK_HIGH_TO_LOW">
                            Risk: High to Low
                        </option>

                        <option value="RISK_LOW_TO_HIGH">
                            Risk: Low to High
                        </option>

                    </select>

                </div>


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>
                                <th>Incident</th>
                                <th>Title</th>
                                <th>User</th>
                                <th>Source IP</th>
                                <th>Severity</th>
                                <th>Risk</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                paginatedIncidents.length === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="empty-table"
                                            >
                                                No incidents found.
                                            </td>

                                        </tr>

                                    )

                                    : paginatedIncidents.map(
                                        (incident) => (

                                            <tr
                                                key={
                                                    incident.incident_id ||
                                                    incident.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        incident.incident_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        incident.title
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        incident.username ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        incident.source_ip ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `severity ${incident.severity?.toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            incident.severity
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        incident.risk_score
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `incident-status ${incident.status?.toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            incident.status
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            openIncident(
                                                                incident.incident_id
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div className="pagination">

                    <button
                        disabled={
                            incidentPage === 1
                        }
                        onClick={() =>
                            setIncidentPage(
                                (page) =>
                                    page - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {incidentPage} of {incidentTotalPages}
                    </span>

                    <button
                        disabled={
                            incidentPage ===
                            incidentTotalPages
                        }
                        onClick={() =>
                            setIncidentPage(
                                (page) =>
                                    page + 1
                            )
                        }
                    >
                        Next
                    </button>

                </div>

            </section>


            {/* ==================================
                LIVE EVENTS
            ================================== */}

            <section className="section">

                <h2>
                    Live Security Events
                </h2>

                <div className="event-feed">

                    {
                        events.length === 0

                            ? (
                                <p>
                                    No security events yet.
                                </p>
                            )

                            : events
                                .slice(0, 15)
                                .map(
                                    (event) => (

                                        <div
                                            className="live-event"
                                            key={event.id}
                                        >

                                            <div className="live-event-icon">
                                                !
                                            </div>

                                            <div className="live-event-main">

                                                <strong>
                                                    {
                                                        event.event_type ||
                                                        event.eventType
                                                    }
                                                </strong>

                                                <span>

                                                    User:{" "}

                                                    {
                                                        event.username ||
                                                        "Unknown"
                                                    }

                                                    {" | IP: "}

                                                    {
                                                        event.source_ip ||
                                                        event.sourceIp ||
                                                        "-"
                                                    }

                                                </span>

                                            </div>

                                            <div className="live-event-time">

                                                {
                                                    event.timestamp

                                                        ? new Date(
                                                            event.timestamp
                                                        ).toLocaleTimeString()

                                                        : "-"
                                                }

                                            </div>

                                        </div>

                                    )
                                )
                    }

                </div>

            </section>


            {/* ==================================
                INCIDENT INVESTIGATION
            ================================== */}

            {
                selectedIncident && (

                    <section className="section incident-panel">

                        <div className="incident-panel-header">

                            <h2>
                                Incident Investigation
                            </h2>

                            <button
                                className="close-button"
                                onClick={() => {

                                    setSelectedIncident(null);
                                    setIncidentNotes([]);
                                    setNewIncidentNote("");
                                    setIncidentHistory([]);
                                }}
                            >
                                Close
                            </button>

                        </div>


                        {/* INCIDENT DETAILS */}

                        <div className="incident-details">

                            <p>
                                <strong>
                                    Incident ID:
                                </strong>{" "}
                                {
                                    selectedIncident.incident_id
                                }
                            </p>

                            <p>
                                <strong>
                                    Title:
                                </strong>{" "}
                                {
                                    selectedIncident.title
                                }
                            </p>

                            <p>
                                <strong>
                                    User:
                                </strong>{" "}
                                {
                                    selectedIncident.username ||
                                    "-"
                                }
                            </p>

                            <p>
                                <strong>
                                    Source IP:
                                </strong>{" "}
                                {
                                    selectedIncident.source_ip ||
                                    "-"
                                }
                            </p>

                            <p>
                                <strong>
                                    Severity:
                                </strong>{" "}
                                {
                                    selectedIncident.severity
                                }
                            </p>

                            <p>
                                <strong>
                                    Risk Score:
                                </strong>{" "}
                                {
                                    selectedIncident.risk_score
                                }
                            </p>

                            <p>

                                <strong>
                                    Status:
                                </strong>{" "}

                                <span
                                    className={
                                        `incident-status ${selectedIncident.status?.toLowerCase()}`
                                    }
                                >
                                    {
                                        selectedIncident.status
                                    }
                                </span>

                            </p>

                        </div>


                        {/* ==================================
                            UPDATED INCIDENT WORKFLOW
                        ================================== */}

                        <div className="status-management">

                            <h3>
                                Incident Workflow
                            </h3>


                            <div className="incident-workflow">

                                <span
                                    className={
                                        `workflow-step ${
                                            selectedIncident.status === "OPEN"
                                                ? "active"
                                                : "completed"
                                        }`
                                    }
                                >
                                    OPEN
                                </span>

                                <span className="workflow-arrow">
                                    →
                                </span>

                                <span
                                    className={
                                        `workflow-step ${
                                            selectedIncident.status ===
                                            "INVESTIGATING"
                                                ? "active"
                                                : selectedIncident.status ===
                                                  "RESOLVED"
                                                    ? "completed"
                                                    : ""
                                        }`
                                    }
                                >
                                    INVESTIGATING
                                </span>

                                <span className="workflow-arrow">
                                    →
                                </span>

                                <span
                                    className={
                                        `workflow-step ${
                                            selectedIncident.status ===
                                            "RESOLVED"
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                >
                                    RESOLVED
                                </span>

                            </div>


                            <div className="status-buttons">

                                <button
                                    className="status-button"
                                    disabled={
                                        statusUpdating ||
                                        selectedIncident.status !==
                                        "OPEN"
                                    }
                                    onClick={() =>
                                        updateIncidentStatus(
                                            "INVESTIGATING"
                                        )
                                    }
                                >
                                    {
                                        statusUpdating
                                            ? "Updating..."
                                            : "Start Investigation"
                                    }
                                </button>


                                <button
                                    className="status-button"
                                    disabled={
                                        statusUpdating ||
                                        selectedIncident.status !==
                                        "INVESTIGATING"
                                    }
                                    onClick={() =>
                                        updateIncidentStatus(
                                            "RESOLVED"
                                        )
                                    }
                                >
                                    {
                                        statusUpdating
                                            ? "Updating..."
                                            : "Resolve Incident"
                                    }
                                </button>

                            </div>


                            {
                                selectedIncident.status ===
                                "RESOLVED"

                                && (

                                    <p className="incident-resolved-message">
                                        Incident investigation completed.
                                    </p>

                                )
                            }

                        </div>


                        {/* ==================================
                            INCIDENT STATUS HISTORY
                        ================================== */}

                        <div className="incident-history-section">

                            <h3>
                                Status History
                            </h3>

                            {
                                incidentHistoryLoading

                                    ? (

                                        <p className="incident-history-message">
                                            Loading status history...
                                        </p>

                                    )

                                    : incidentHistory.length === 0

                                        ? (

                                            <div className="incident-history-empty">

                                                <p>
                                                    No status changes recorded yet.
                                                </p>

                                                <span>
                                                    Current status:{" "}
                                                    {
                                                        selectedIncident.status ||
                                                        "OPEN"
                                                    }
                                                </span>

                                            </div>

                                        )

                                        : (

                                            <div className="incident-history-list">

                                                {
                                                    incidentHistory.map(
                                                        (historyItem) => (

                                                            <div
                                                                className="incident-history-item"
                                                                key={historyItem.id}
                                                            >

                                                                <div className="incident-history-marker">
                                                                    ●
                                                                </div>

                                                                <div className="incident-history-content">

                                                                    <strong>

                                                                        {
                                                                            historyItem.old_status ||
                                                                            "OPEN"
                                                                        }

                                                                        {" → "}

                                                                        {
                                                                            historyItem.new_status
                                                                        }

                                                                    </strong>

                                                                    <span>

                                                                        {
                                                                            historyItem.changed_at

                                                                                ? new Date(
                                                                                    historyItem.changed_at
                                                                                ).toLocaleString()

                                                                                : "-"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>
                                        )
                            }

                        </div>


                        {/* ==================================
                            LINKED ALERTS
                        ================================== */}

                        <div className="linked-alerts">

                            <h3>
                                Linked Alerts
                            </h3>

                            {
                                selectedIncident.alerts &&
                                selectedIncident.alerts.length > 0

                                    ? selectedIncident.alerts.map(
                                        (linkedAlert) => (

                                            <div
                                                className="linked-alert"
                                                key={linkedAlert.id}
                                            >

                                                <strong>
                                                    {
                                                        linkedAlert.title ||
                                                        linkedAlert.alert_type
                                                    }
                                                </strong>

                                                <p>

                                                    Severity:{" "}
                                                    {
                                                        linkedAlert.severity
                                                    }

                                                    {" | Risk: "}

                                                    {
                                                        linkedAlert.risk_score
                                                    }

                                                </p>

                                                {
                                                    linkedAlert.mitre_technique

                                                    && (

                                                        <p>

                                                            MITRE:{" "}

                                                            {
                                                                linkedAlert.mitre_technique
                                                            }

                                                            {" ("}

                                                            {
                                                                linkedAlert.mitre_technique_id
                                                            }

                                                            {")"}

                                                        </p>
                                                    )
                                                }

                                            </div>

                                        )
                                    )

                                    : (
                                        <p>
                                            No linked alerts.
                                        </p>
                                    )
                            }

                        </div>


                        {/* ==================================
                            EVENT TIMELINE
                        ================================== */}

                        <div className="incident-timeline">

                            <h3>
                                Event Timeline
                            </h3>

                            {
                                selectedIncident.events &&
                                selectedIncident.events.length > 0

                                    ? selectedIncident.events.map(
                                        (event) => (

                                            <div
                                                className="timeline-event"
                                                key={event.id}
                                            >

                                                <strong>
                                                    {
                                                        event.event_type ||
                                                        event.eventType
                                                    }
                                                </strong>

                                                <p>

                                                    {
                                                        event.timestamp

                                                            ? new Date(
                                                                event.timestamp
                                                            ).toLocaleString()

                                                            : "-"
                                                    }

                                                </p>

                                            </div>

                                        )
                                    )

                                    : (
                                        <p>
                                            No timeline events.
                                        </p>
                                    )
                            }

                        </div>


                        {/* ==================================
                            INCIDENT NOTES
                        ================================== */}

                        <div className="incident-notes-section">

                            <h3>
                                Analyst Notes
                            </h3>

                            <div className="incident-note-form">

                                <textarea
                                    placeholder="Write an incident investigation note..."
                                    value={newIncidentNote}
                                    maxLength={2000}
                                    onChange={(e) =>
                                        setNewIncidentNote(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    onClick={
                                        addIncidentNote
                                    }
                                    disabled={
                                        incidentNoteSaving ||
                                        !newIncidentNote.trim()
                                    }
                                >
                                    {
                                        incidentNoteSaving
                                            ? "Saving..."
                                            : "Add Note"
                                    }
                                </button>

                            </div>


                            {
                                incidentNotesLoading

                                    ? (
                                        <p className="incident-notes-message">
                                            Loading incident notes...
                                        </p>
                                    )

                                    : incidentNotes.length === 0

                                        ? (
                                            <p className="incident-notes-message">
                                                No analyst notes yet.
                                            </p>
                                        )

                                        : (

                                            <div className="incident-notes-list">

                                                {
                                                    incidentNotes.map(
                                                        (noteItem) => (

                                                            <div
                                                                className="incident-note"
                                                                key={noteItem.id}
                                                            >

                                                                <p>
                                                                    {
                                                                        noteItem.note
                                                                    }
                                                                </p>

                                                                <span>

                                                                    {
                                                                        noteItem.created_at

                                                                            ? new Date(
                                                                                noteItem.created_at
                                                                            ).toLocaleString()

                                                                            : "-"
                                                                    }

                                                                </span>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>
                                        )
                            }

                        </div>

                    </section>
                )
            }

        </div>
    );
}

export default App;