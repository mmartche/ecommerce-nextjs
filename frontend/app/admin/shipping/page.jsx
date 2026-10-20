"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    apiDelete,
    apiGet,
    apiPatch,
    apiPost,
} from "@/lib/api";

const EMPTY_FORM = {
    provider: "CTT",
    service: "Standard",

    zoneName: "",

    postalCodeFrom: "",
    postalCodeTo: "",

    minWeightGrams: "",
    maxWeightGrams: "",

    price: "",

    estimatedDelivery: "",
    deliveryNote: "",

    active: true,
};

export default function ShippingAdminPage() {
    const [rates, setRates] =
        useState([]);

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    useEffect(() => {
        loadRates();
    }, []);

    async function loadRates() {
        try {
            setLoading(true);
            setError("");

            const data =
                await apiGet(
                    "/api/admin/shipping-rates"
                );

            setRates(data);
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    }

    function updateField(
        field,
        value
    ) {
        setForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    }

    function resetForm() {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });
    }

    function editRate(rate) {
        setEditingId(
            rate.id
        );

        setForm({
            provider:
                rate.provider || "",

            service:
                rate.service || "",

            zoneName:
                rate.zoneName || "",

            postalCodeFrom:
                rate.postalCodeFrom,

            postalCodeTo:
                rate.postalCodeTo,

            minWeightGrams:
                rate.minWeightGrams,

            maxWeightGrams:
                rate.maxWeightGrams,

            price:
                rate.price,

            estimatedDelivery:
                rate.estimatedDelivery ||
                "",

            deliveryNote:
                rate.deliveryNote ||
                "",

            active:
                rate.active,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setError("");
        setSuccess("");

        const payload = {
            provider:
                form.provider.trim(),

            service:
                form.service.trim(),

            zoneName:
                form.zoneName.trim(),

            postalCodeFrom:
                Number(
                    form.postalCodeFrom
                ),

            postalCodeTo:
                Number(
                    form.postalCodeTo
                ),

            minWeightGrams:
                Number(
                    form.minWeightGrams
                ),

            maxWeightGrams:
                Number(
                    form.maxWeightGrams
                ),

            price:
                Number(
                    form.price
                ),

            estimatedDelivery:
                form.estimatedDelivery
                    .trim() ||
                undefined,

            deliveryNote:
                form.deliveryNote
                    .trim() ||
                undefined,

            active:
                Boolean(
                    form.active
                ),
        };

        if (
            payload.postalCodeFrom >
            payload.postalCodeTo
        ) {
            setError(
                "Postal code from cannot be greater than postal code to."
            );

            return;
        }

        if (
            payload.minWeightGrams >
            payload.maxWeightGrams
        ) {
            setError(
                "Minimum weight cannot be greater than maximum weight."
            );

            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                await apiPatch(
                    `/api/admin/shipping-rates/${editingId}`,
                    payload
                );

                setSuccess(
                    "Shipping rate updated successfully."
                );
            } else {
                await apiPost(
                    "/api/admin/shipping-rates",
                    payload
                );

                setSuccess(
                    "Shipping rate created successfully."
                );
            }

            resetForm();

            await loadRates();
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteRate(
        rate
    ) {
        const confirmed =
            window.confirm(
                `Delete shipping rate "${rate.zoneName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await apiDelete(
                `/api/admin/shipping-rates/${rate.id}`
            );

            setSuccess(
                "Shipping rate deleted."
            );

            await loadRates();
        } catch (error) {
            setError(
                error.message
            );
        }
    }

    async function toggleActive(
        rate
    ) {
        try {
            setError("");
            setSuccess("");

            await apiPatch(
                `/api/admin/shipping-rates/${rate.id}`,
                {
                    provider:
                        rate.provider,

                    service:
                        rate.service,

                    zoneName:
                        rate.zoneName,

                    postalCodeFrom:
                        rate.postalCodeFrom,

                    postalCodeTo:
                        rate.postalCodeTo,

                    minWeightGrams:
                        rate.minWeightGrams,

                    maxWeightGrams:
                        rate.maxWeightGrams,

                    price:
                        Number(
                            rate.price
                        ),

                    estimatedDelivery:
                        rate.estimatedDelivery ||
                        undefined,

                    deliveryNote:
                        rate.deliveryNote ||
                        undefined,

                    active:
                        !rate.active,
                }
            );

            await loadRates();
        } catch (error) {
            setError(
                error.message
            );
        }
    }

    return (
        <main
            style={
                styles.container
            }
        >
            <div
                style={
                    styles.header
                }
            >
                <div>
                    <h1
                        style={
                            styles.title
                        }
                    >
                        Shipping rates
                    </h1>

                    <p
                        style={
                            styles.subtitle
                        }
                    >
                        Manage shipping prices
                        by postal code and
                        package weight.
                    </p>
                </div>

                {editingId && (
                    <button
                        type="button"
                        onClick={
                            resetForm
                        }
                        style={
                            styles.secondaryButton
                        }
                    >
                        + New rate
                    </button>
                )}
            </div>

            {error && (
                <div
                    style={
                        styles.error
                    }
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={
                        styles.success
                    }
                >
                    {success}
                </div>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
                style={
                    styles.formCard
                }
            >
                <div
                    style={
                        styles.formHeader
                    }
                >
                    <div>
                        <h2
                            style={
                                styles.sectionTitle
                            }
                        >
                            {editingId
                                ? "Edit shipping rate"
                                : "New shipping rate"}
                        </h2>

                        <p
                            style={
                                styles.helperText
                            }
                        >
                            Define where this
                            shipping price applies.
                        </p>
                    </div>

                    {editingId && (
                        <span
                            style={
                                styles.editBadge
                            }
                        >
                            Editing #{editingId}
                        </span>
                    )}
                </div>

                <section
                    style={
                        styles.formSection
                    }
                >
                    <h3
                        style={
                            styles.formSectionTitle
                        }
                    >
                        Shipping service
                    </h3>

                    <div
                        style={
                            styles.grid3
                        }
                    >
                        <Field
                            label="Provider"
                            value={
                                form.provider
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "provider",
                                    value
                                )
                            }
                            placeholder="CTT"
                        />

                        <Field
                            label="Service"
                            value={
                                form.service
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "service",
                                    value
                                )
                            }
                            placeholder="Standard"
                        />

                        <Field
                            label="Zone name"
                            value={
                                form.zoneName
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "zoneName",
                                    value
                                )
                            }
                            placeholder="Portugal Mainland"
                        />
                    </div>
                </section>

                <section
                    style={
                        styles.formSection
                    }
                >
                    <h3
                        style={
                            styles.formSectionTitle
                        }
                    >
                        Postal code range
                    </h3>

                    <p
                        style={
                            styles.helperText
                        }
                    >
                        Use the first four
                        digits of Portuguese
                        postal codes.
                    </p>

                    <div
                        style={
                            styles.grid2
                        }
                    >
                        <Field
                            label="From"
                            type="number"
                            min="1000"
                            max="9999"
                            value={
                                form.postalCodeFrom
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "postalCodeFrom",
                                    value
                                )
                            }
                            placeholder="1000"
                        />

                        <Field
                            label="To"
                            type="number"
                            min="1000"
                            max="9999"
                            value={
                                form.postalCodeTo
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "postalCodeTo",
                                    value
                                )
                            }
                            placeholder="8999"
                        />
                    </div>
                </section>

                <section
                    style={
                        styles.formSection
                    }
                >
                    <h3
                        style={
                            styles.formSectionTitle
                        }
                    >
                        Weight & price
                    </h3>

                    <div
                        style={
                            styles.grid3
                        }
                    >
                        <Field
                            label="Minimum weight (g)"
                            type="number"
                            min="0"
                            value={
                                form.minWeightGrams
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "minWeightGrams",
                                    value
                                )
                            }
                            placeholder="1"
                        />

                        <Field
                            label="Maximum weight (g)"
                            type="number"
                            min="1"
                            value={
                                form.maxWeightGrams
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "maxWeightGrams",
                                    value
                                )
                            }
                            placeholder="500"
                        />

                        <Field
                            label="Price (€)"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                form.price
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "price",
                                    value
                                )
                            }
                            placeholder="4.50"
                        />
                    </div>
                </section>

                <section
                    style={
                        styles.formSection
                    }
                >
                    <h3
                        style={
                            styles.formSectionTitle
                        }
                    >
                        Delivery information
                    </h3>

                    <Field
                        label="Estimated delivery"
                        value={
                            form.estimatedDelivery
                        }
                        onChange={(
                            value
                        ) =>
                            updateField(
                                "estimatedDelivery",
                                value
                            )
                        }
                        placeholder="About 3 business days"
                        required={false}
                    />

                    <label
                        style={
                            styles.label
                        }
                    >
                        Delivery note

                        <textarea
                            value={
                                form.deliveryNote
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "deliveryNote",
                                    event.target.value
                                )
                            }
                            placeholder="Delivery time is indicative."
                            rows={3}
                            style={
                                styles.textarea
                            }
                        />
                    </label>
                </section>

                <label
                    style={
                        styles.activeOption
                    }
                >
                    <input
                        type="checkbox"
                        checked={
                            form.active
                        }
                        onChange={(
                            event
                        ) =>
                            updateField(
                                "active",
                                event.target.checked
                            )
                        }
                    />

                    <div>
                        <strong>
                            Active shipping
                            rate
                        </strong>

                        <div
                            style={
                                styles.activeDescription
                            }
                        >
                            Customers can use
                            this rate during
                            checkout.
                        </div>
                    </div>
                </label>

                <div
                    style={
                        styles.formActions
                    }
                >
                    {editingId && (
                        <button
                            type="button"
                            onClick={
                                resetForm
                            }
                            style={
                                styles.secondaryButton
                            }
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        style={{
                            ...styles.primaryButton,

                            opacity:
                                saving
                                    ? 0.6
                                    : 1,
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Save changes"
                                : "Create shipping rate"}
                    </button>
                </div>
            </form>

            <section
                style={
                    styles.ratesSection
                }
            >
                <div
                    style={
                        styles.ratesHeader
                    }
                >
                    <div>
                        <h2
                            style={
                                styles.sectionTitle
                            }
                        >
                            Current rates
                        </h2>

                        <p
                            style={
                                styles.helperText
                            }
                        >
                            {rates.length} shipping
                            rate
                            {rates.length === 1
                                ? ""
                                : "s"}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div
                        style={
                            styles.emptyState
                        }
                    >
                        Loading shipping
                        rates...
                    </div>
                ) : rates.length ===
                    0 ? (
                    <div
                        style={
                            styles.emptyState
                        }
                    >
                        No shipping rates
                        configured yet.
                    </div>
                ) : (
                    <div
                        style={
                            styles.tableWrapper
                        }
                    >
                        <table
                            style={
                                styles.table
                            }
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Zone
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Service
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Postal codes
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Weight
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Price
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Delivery
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Status
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rates.map(
                                    (rate) => (
                                        <tr
                                            key={
                                                rate.id
                                            }
                                        >
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        rate.zoneName
                                                    }
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    rate.provider
                                                }

                                                <div
                                                    style={
                                                        styles.cellSecondary
                                                    }
                                                >
                                                    {
                                                        rate.service
                                                    }
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    rate.postalCodeFrom
                                                }
                                                {" – "}
                                                {
                                                    rate.postalCodeTo
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    rate.minWeightGrams
                                                }
                                                g
                                                {" – "}
                                                {
                                                    rate.maxWeightGrams
                                                }
                                                g
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    €
                                                    {Number(
                                                        rate.price
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {rate.estimatedDelivery ||
                                                    "—"}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleActive(
                                                            rate
                                                        )
                                                    }
                                                    style={{
                                                        ...styles.statusBadge,

                                                        background:
                                                            rate.active
                                                                ? "#edf9f0"
                                                                : "#f3f3f3",

                                                        color:
                                                            rate.active
                                                                ? "#176b2c"
                                                                : "#777",
                                                    }}
                                                >
                                                    {rate.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </button>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <div
                                                    style={
                                                        styles.rowActions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editRate(
                                                                rate
                                                            )
                                                        }
                                                        style={
                                                            styles.editButton
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteRate(
                                                                rate
                                                            )
                                                        }
                                                        style={
                                                            styles.deleteButton
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    min,
    max,
    step,
    placeholder,
    required = true,
}) {
    return (
        <label
            style={
                styles.label
            }
        >
            {label}

            <input
                type={type}
                min={min}
                max={max}
                step={step}
                value={value}
                placeholder={
                    placeholder
                }
                required={
                    required
                }
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target.value
                    )
                }
                style={
                    styles.input
                }
            />
        </label>
    );
}

const styles = {
    container: {
        maxWidth: "1300px",
        margin: "0 auto",
        padding:
            "40px 20px 80px",
        fontFamily:
            "Arial, sans-serif",
    },

    header: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems:
            "flex-end",
        gap: "20px",
        marginBottom:
            "28px",
    },

    title: {
        margin: 0,
        fontSize: "34px",
    },

    subtitle: {
        margin:
            "8px 0 0",
        color: "#777",
    },

    formCard: {
        border:
            "1px solid #e4e4e4",
        borderRadius:
            "18px",
        padding: "26px",
        background: "#fff",
        marginBottom:
            "44px",
    },

    formHeader: {
        display: "flex",
        justifyContent:
            "space-between",
        gap: "20px",
        alignItems:
            "flex-start",
        marginBottom:
            "8px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "22px",
    },

    helperText: {
        margin:
            "7px 0 0",
        color: "#777",
        fontSize: "14px",
    },

    editBadge: {
        padding:
            "7px 10px",
        borderRadius:
            "20px",
        background:
            "#f0f0f0",
        fontSize: "12px",
    },

    formSection: {
        padding:
            "24px 0",
        borderBottom:
            "1px solid #eee",
    },

    formSectionTitle: {
        margin:
            "0 0 16px",
        fontSize: "16px",
    },

    grid2: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
    },

    grid3: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "16px",
    },

    label: {
        display: "grid",
        gap: "7px",
        marginBottom:
            "14px",
        fontWeight: 600,
        fontSize: "14px",
    },

    input: {
        width: "100%",
        boxSizing:
            "border-box",
        padding:
            "12px 13px",
        border:
            "1px solid #ccc",
        borderRadius:
            "9px",
        fontSize: "14px",
    },

    textarea: {
        width: "100%",
        boxSizing:
            "border-box",
        padding:
            "12px 13px",
        border:
            "1px solid #ccc",
        borderRadius:
            "9px",
        resize: "vertical",
        fontFamily:
            "inherit",
    },

    activeOption: {
        display: "flex",
        alignItems:
            "flex-start",
        gap: "10px",
        padding:
            "20px 0",
        cursor: "pointer",
    },

    activeDescription: {
        marginTop: "4px",
        color: "#777",
        fontSize: "13px",
    },

    formActions: {
        display: "flex",
        justifyContent:
            "flex-end",
        gap: "10px",
        paddingTop:
            "10px",
    },

    primaryButton: {
        border: "none",
        background: "#111",
        color: "#fff",
        padding:
            "13px 18px",
        borderRadius:
            "9px",
        cursor: "pointer",
        fontWeight: 600,
    },

    secondaryButton: {
        border:
            "1px solid #ccc",
        background: "#fff",
        padding:
            "12px 18px",
        borderRadius:
            "9px",
        cursor: "pointer",
    },

    error: {
        marginBottom:
            "20px",
        padding: "14px",
        background:
            "#fff2f2",
        border:
            "1px solid #efb2b2",
        color: "#a00000",
        borderRadius:
            "10px",
    },

    success: {
        marginBottom:
            "20px",
        padding: "14px",
        background:
            "#effaf1",
        border:
            "1px solid #b6dfbd",
        color: "#176b2c",
        borderRadius:
            "10px",
    },

    ratesSection: {
        marginTop:
            "20px",
    },

    ratesHeader: {
        display: "flex",
        justifyContent:
            "space-between",
        marginBottom:
            "20px",
    },

    tableWrapper: {
        overflowX: "auto",
        border:
            "1px solid #e5e5e5",
        borderRadius:
            "14px",
    },

    table: {
        width: "100%",
        borderCollapse:
            "collapse",
        minWidth: "950px",
    },

    th: {
        textAlign: "left",
        padding:
            "13px 14px",
        background:
            "#f7f7f7",
        borderBottom:
            "1px solid #ddd",
        fontSize: "13px",
        color: "#555",
    },

    td: {
        padding:
            "15px 14px",
        borderBottom:
            "1px solid #eee",
        verticalAlign:
            "top",
        fontSize: "14px",
    },

    cellSecondary: {
        marginTop: "3px",
        color: "#777",
        fontSize: "12px",
    },

    rowActions: {
        display: "flex",
        gap: "7px",
    },

    editButton: {
        border:
            "1px solid #ccc",
        background: "#fff",
        borderRadius:
            "7px",
        padding:
            "7px 10px",
        cursor: "pointer",
    },

    deleteButton: {
        border:
            "1px solid #efb2b2",
        background:
            "#fff5f5",
        color: "#a00000",
        borderRadius:
            "7px",
        padding:
            "7px 10px",
        cursor: "pointer",
    },

    statusBadge: {
        border: "none",
        borderRadius:
            "20px",
        padding:
            "6px 10px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
    },

    emptyState: {
        border:
            "1px dashed #ccc",
        borderRadius:
            "12px",
        padding:
            "40px 20px",
        textAlign:
            "center",
        color: "#777",
    },
};