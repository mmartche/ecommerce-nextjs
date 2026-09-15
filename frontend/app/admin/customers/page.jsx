"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    useAuth,
} from "../../../context/AuthContext";
import Link from "next/link";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

export default function CustomersPage() {
    const router = useRouter();

    const {
        user,
        loading: authLoading,
    } = useAuth();

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace(
                "/login?redirect=/admin/customers"
            );

            return;
        }

        if (user.role !== "ADMIN") {
            router.replace("/account");
            return;
        }

        loadUsers();
    }, [
        authLoading,
        user,
        router,
    ]);

    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/admin/users`,
                    {
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to load customers"
                );
            }

            setUsers(data);
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateRole(
        userId,
        role
    ) {
        try {
            setUpdatingId(userId);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/admin/users/${userId}/role`,
                    {
                        method: "PATCH",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                role,
                            }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to update role"
                );
            }

            setUsers((current) =>
                current.map((item) =>
                    item.id === userId
                        ? {
                            ...item,
                            role:
                                data.role,
                        }
                        : item
                )
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setUpdatingId(null);
        }
    }

    if (authLoading) {
        return (
            <main style={styles.container}>
                Checking access...
            </main>
        );
    }

    if (
        !user ||
        user.role !== "ADMIN"
    ) {
        return null;
    }

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>
                        ADMINISTRATION
                    </p>

                    <h1 style={styles.title}>
                        Customers
                    </h1>

                    <p style={styles.subtitle}>
                        Manage registered users
                        and permissions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    style={
                        styles.refreshButton
                    }
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {loading ? (
                <p>
                    Loading customers...
                </p>
            ) : users.length === 0 ? (
                <div style={styles.empty}>
                    No customers found.
                </div>
            ) : (
                <div
                    style={
                        styles.tableWrapper
                    }
                >
                    <table
                        style={styles.table}
                    >
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    ID
                                </th>

                                <th style={styles.th}>
                                    Name
                                </th>

                                <th style={styles.th}>
                                    Email
                                </th>

                                <th style={styles.th}>
                                    Registered
                                </th>

                                <th style={styles.th}>
                                    Role
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map(
                                (item) => (
                                    <tr
                                        key={item.id}
                                    >
                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            #{item.id}
                                        </td>

                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            <Link
                                                href={`/admin/customers/${item.id}`}
                                                style={{
                                                    color: "#111",
                                                    fontWeight: "600",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {item.name}
                                            </Link>
                                        </td>

                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            {item.email}
                                        </td>

                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleString()}
                                        </td>

                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            <select
                                                value={
                                                    item.role
                                                }
                                                disabled={
                                                    updatingId ===
                                                    item.id
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateRole(
                                                        item.id,
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                style={
                                                    styles.select
                                                }
                                            >
                                                <option
                                                    value="CUSTOMER"
                                                >
                                                    Customer
                                                </option>

                                                <option
                                                    value="ADMIN"
                                                >
                                                    Admin
                                                </option>
                                            </select>

                                            {updatingId ===
                                                item.id && (
                                                    <div
                                                        style={
                                                            styles.saving
                                                        }
                                                    >
                                                        Saving...
                                                    </div>
                                                )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 20px",
    },

    header: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems:
            "flex-start",
        gap: "20px",
        marginBottom: "30px",
    },

    eyebrow: {
        margin: 0,
        fontSize: "12px",
        letterSpacing: "2px",
        color: "#777",
    },

    title: {
        marginBottom: "8px",
    },

    subtitle: {
        margin: 0,
        color: "#666",
    },

    refreshButton: {
        border:
            "1px solid #ccc",
        background: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
    },

    error: {
        padding: "14px",
        border:
            "1px solid #f3b3b3",
        background: "#fff4f4",
        borderRadius: "8px",
        marginBottom: "20px",
    },

    empty: {
        border:
            "1px solid #ddd",
        borderRadius: "12px",
        padding: "30px",
    },

    tableWrapper: {
        overflowX: "auto",
        border:
            "1px solid #ddd",
        borderRadius: "12px",
    },

    table: {
        width: "100%",
        borderCollapse:
            "collapse",
        minWidth: "800px",
    },

    th: {
        textAlign: "left",
        padding: "14px",
        borderBottom:
            "1px solid #ddd",
        background: "#f7f7f7",
        fontSize: "13px",
    },

    td: {
        padding: "14px",
        borderBottom:
            "1px solid #eee",
        verticalAlign:
            "middle",
    },

    select: {
        padding: "8px 10px",
        borderRadius: "8px",
        border:
            "1px solid #ccc",
        background: "#fff",
    },

    saving: {
        marginTop: "5px",
        fontSize: "11px",
        color: "#777",
    },
};