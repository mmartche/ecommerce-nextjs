"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailsPage() {
  const params =
    useParams();

  const orderId =
    params.id;

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  async function loadOrder() {
    const data =
      await apiGet(
        `${API_URL}/api/admin/orders/${orderId}`
      );

    setOrder(data);

    setStatus(
      data.status || ""
    );
  }

  async function loadMessages() {
    const data =
      await apiGet(
        `${API_URL}/api/admin/orders/${orderId}/messages`
      );

    setMessages(
      Array.isArray(data)
        ? data
        : []
    );
  }

  useEffect(() => {
    if (!orderId) {
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          loadOrder(),
          loadMessages(),
        ]);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
          "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [
    orderId,
  ]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const interval =
      setInterval(
        () => {
          loadMessages()
            .catch(
              console.error
            );
        },
        15000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    orderId,
  ]);

  async function sendMessage(
    event
  ) {
    event.preventDefault();

    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      setError("");
      setSuccess("");

      await apiPost(
        `${API_URL}/api/admin/orders/${orderId}/messages`,
        {
          message:
            cleanMessage,
        }
      );

      setMessage("");

      await loadMessages();

      setSuccess(
        "Message sent."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  async function updateStatus() {
    if (
      !status ||
      updatingStatus
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);

      setError("");
      setSuccess("");

      await apiPatch(
        `${API_URL}/api/admin/orders/${orderId}`,
        {
          status,
        }
      );

      await loadOrder();
      await loadMessages();

      setSuccess(
        "Order status updated."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <main
        style={
          styles.container
        }
      >
        Loading order...
      </main>
    );
  }

  if (!order) {
    return (
      <main
        style={
          styles.container
        }
      >
        <div
          style={
            styles.error
          }
        >
          {error ||
            "Order not found."}
        </div>
      </main>
    );
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
          <div
            style={
              styles.eyebrow
            }
          >
            Admin order
          </div>

          <h1
            style={
              styles.title
            }
          >
            Order #{order.id}
          </h1>

          {order.createdAt && (
            <div
              style={
                styles.date
              }
            >
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </div>
          )}
        </div>

        <div
          style={
            styles.statusEditor
          }
        >
          <select
            value={
              status
            }
            onChange={(
              event
            ) =>
              setStatus(
                event.target.value
              )
            }
            style={
              styles.select
            }
          >
            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              updateStatus
            }
            disabled={
              updatingStatus ||
              status ===
                order.status
            }
            style={{
              ...styles.primaryButton,

              opacity:
                updatingStatus ||
                status ===
                  order.status
                  ? 0.5
                  : 1,
            }}
          >
            {updatingStatus
              ? "Updating..."
              : "Update status"}
          </button>
        </div>
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

      <div
        style={
          styles.layout
        }
      >
        <div>
          <section
            style={
              styles.card
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Customer
            </h2>

            <div
              style={
                styles.detailsGrid
              }
            >
              <Detail
                label="Name"
                value={
                  order.shippingName
                }
              />

              <Detail
                label="Address"
                value={
                  order.shippingAddress
                }
              />

              <Detail
                label="Postal code"
                value={
                  order.shippingPostalCode
                }
              />

              <Detail
                label="City"
                value={
                  order.shippingCity
                }
              />

              <Detail
                label="Country"
                value={
                  order.shippingCountry
                }
              />

              <Detail
                label="Shipping"
                value={
                  order.shippingProvider
                    ? `${order.shippingProvider} ${order.shippingService || ""}`
                    : "—"
                }
              />
            </div>
          </section>

          <section
            style={
              styles.card
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Items
            </h2>

            <div
              style={
                styles.items
              }
            >
              {order.items?.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    style={
                      styles.item
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.product
                            ?.name
                        }
                      </strong>

                      <div
                        style={
                          styles.itemMeta
                        }
                      >
                        Quantity:{" "}
                        {
                          item.quantity
                        }
                      </div>

                      {item.keys != null && (
                        <div
                          style={
                            styles.itemMeta
                          }
                        >
                          Keys:{" "}
                          {
                            item.keys
                          }
                        </div>
                      )}

                      {item.characters && (
                        <div
                          style={
                            styles.itemMeta
                          }
                        >
                          Characters:{" "}
                          {
                            item.characters
                          }
                        </div>
                      )}

                      {item.colorName && (
                        <div
                          style={
                            styles.itemMeta
                          }
                        >
                          Color:{" "}
                          {
                            item.colorName
                          }
                        </div>
                      )}

                      {item.fontName && (
                        <div
                          style={
                            styles.itemMeta
                          }
                        >
                          Font:{" "}
                          {
                            item.fontName
                          }
                        </div>
                      )}
                    </div>

                    {item.totalPrice != null && (
                      <strong>
                        €
                        {Number(
                          item.totalPrice
                        ).toFixed(
                          2
                        )}
                      </strong>
                    )}
                  </div>
                )
              )}
            </div>

            <div
              style={
                styles.summary
              }
            >
              <SummaryRow
                label="Subtotal"
                value={`€${Number(
                  order.subtotal ||
                    0
                ).toFixed(2)}`}
              />

              <SummaryRow
                label="Shipping"
                value={`€${Number(
                  order.shipping ||
                    0
                ).toFixed(2)}`}
              />

              <div
                style={
                  styles.totalRow
                }
              >
                <strong>
                  Total
                </strong>

                <strong>
                  €
                  {Number(
                    order.total ||
                      0
                  ).toFixed(
                    2
                  )}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section
          style={
            styles.chatCard
          }
        >
          <div
            style={
              styles.chatHeader
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Order history
            </h2>

            <p
              style={
                styles.chatSubtitle
              }
            >
              Messages and status
              changes for this order.
            </p>
          </div>

          <div
            style={
              styles.messages
            }
          >
            {messages.length ===
              0 && (
              <div
                style={
                  styles.noMessages
                }
              >
                No messages yet.
              </div>
            )}

            {messages.map(
              (item) => (
                <AdminMessage
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                />
              )
            )}
          </div>

          <form
            onSubmit={
              sendMessage
            }
            style={
              styles.messageForm
            }
          >
            <textarea
              value={
                message
              }
              onChange={(
                event
              ) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Write a message to the customer..."
              rows={3}
              maxLength={2000}
              style={
                styles.textarea
              }
            />

            <div
              style={
                styles.sendRow
              }
            >
              <small
                style={
                  styles.counter
                }
              >
                {message.length}
                /2000
              </small>

              <button
                type="submit"
                disabled={
                  sending ||
                  !message.trim()
                }
                style={{
                  ...styles.primaryButton,

                  opacity:
                    sending ||
                    !message.trim()
                      ? 0.5
                      : 1,
                }}
              >
                {sending
                  ? "Sending..."
                  : "Send message"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function AdminMessage({
  item,
}) {
  if (
    item.type ===
      "SYSTEM" ||
    item.type ===
      "STATUS"
  ) {
    return (
      <div
        style={
          styles.systemMessage
        }
      >
        <div>
          {item.type ===
          "STATUS"
            ? `Status changed to ${item.message}`
            : item.message}
        </div>

        <small>
          {new Date(
            item.createdAt
          ).toLocaleString()}
        </small>
      </div>
    );
  }

  const admin =
    item.authorType ===
    "ADMIN";

  return (
    <div
      style={{
        ...styles.messageRow,

        justifyContent:
          admin
            ? "flex-end"
            : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.messageBubble,

          background:
            admin
              ? "#111"
              : "#e8eef7",

          color:
            admin
              ? "#fff"
              : "#111",
        }}
      >
        <div
          style={
            styles.messageAuthor
          }
        >
          {admin
            ? "You"
            : "Customer"}
        </div>

        <div
          style={
            styles.messageText
          }
        >
          {item.message}
        </div>

        <small
          style={{
            ...styles.messageDate,

            color:
              admin
                ? "#ccc"
                : "#777",
          }}
        >
          {new Date(
            item.createdAt
          ).toLocaleString()}
        </small>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div>
      <div
        style={
          styles.detailLabel
        }
      >
        {label}
      </div>

      <div>
        {value || "—"}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.summaryRow
      }
    >
      <span>
        {label}
      </span>

      <span>
        {value}
      </span>
    </div>
  );
}

const styles = {
  container: {
    maxWidth:
      "1250px",

    margin:
      "0 auto",

    padding:
      "40px 20px 80px",
  },

  header: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      "20px",

    marginBottom:
      "28px",
  },

  eyebrow: {
    color:
      "#777",

    fontSize:
      "12px",

    textTransform:
      "uppercase",
  },

  title: {
    margin:
      "5px 0",

    fontSize:
      "36px",
  },

  date: {
    color:
      "#777",

    fontSize:
      "13px",
  },

  statusEditor: {
    display:
      "flex",

    gap:
      "10px",

    alignItems:
      "center",
  },

  select: {
    padding:
      "11px 12px",

    border:
      "1px solid #ccc",

    borderRadius:
      "9px",

    background:
      "#fff",
  },

  primaryButton: {
    border:
      "none",

    background:
      "#111",

    color:
      "#fff",

    borderRadius:
      "9px",

    padding:
      "11px 16px",

    cursor:
      "pointer",

    fontWeight:
      600,
  },

  error: {
    marginBottom:
      "20px",

    padding:
      "14px",

    borderRadius:
      "10px",

    background:
      "#fff2f2",

    color:
      "#a00000",
  },

  success: {
    marginBottom:
      "20px",

    padding:
      "14px",

    borderRadius:
      "10px",

    background:
      "#effaf1",

    color:
      "#176b2c",
  },

  layout: {
    display:
      "grid",

    gridTemplateColumns:
      "minmax(0, 1fr) minmax(350px, 450px)",

    gap:
      "30px",

    alignItems:
      "start",
  },

  card: {
    padding:
      "24px",

    border:
      "1px solid #ddd",

    borderRadius:
      "16px",

    marginBottom:
      "20px",

    background:
      "#fff",
  },

  sectionTitle: {
    margin:
      "0 0 18px",

    fontSize:
      "20px",
  },

  detailsGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",

    gap:
      "18px",
  },

  detailLabel: {
    marginBottom:
      "4px",

    color:
      "#777",

    fontSize:
      "12px",

    textTransform:
      "uppercase",
  },

  items: {
    display:
      "grid",

    gap:
      "16px",
  },

  item: {
    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      "20px",

    paddingBottom:
      "16px",

    borderBottom:
      "1px solid #eee",
  },

  itemMeta: {
    marginTop:
      "4px",

    color:
      "#777",

    fontSize:
      "13px",
  },

  summary: {
    display:
      "grid",

    gap:
      "10px",

    marginTop:
      "20px",
  },

  summaryRow: {
    display:
      "flex",

    justifyContent:
      "space-between",
  },

  totalRow: {
    display:
      "flex",

    justifyContent:
      "space-between",

    borderTop:
      "1px solid #ddd",

    paddingTop:
      "15px",

    marginTop:
      "5px",

    fontSize:
      "18px",
  },

  chatCard: {
    position:
      "sticky",

    top:
      "20px",

    border:
      "1px solid #ddd",

    borderRadius:
      "16px",

    overflow:
      "hidden",

    background:
      "#fff",
  },

  chatHeader: {
    padding:
      "20px",

    borderBottom:
      "1px solid #eee",
  },

  chatSubtitle: {
    margin:
      "-10px 0 0",

    color:
      "#777",

    fontSize:
      "13px",
  },

  messages: {
    height:
      "500px",

    overflowY:
      "auto",

    padding:
      "20px",

    display:
      "flex",

    flexDirection:
      "column",

    gap:
      "14px",

    background:
      "#fafafa",
  },

  noMessages: {
    margin:
      "auto",

    color:
      "#888",
  },

  messageRow: {
    display:
      "flex",
  },

  messageBubble: {
    maxWidth:
      "80%",

    padding:
      "11px 13px",

    borderRadius:
      "14px",
  },

  messageAuthor: {
    fontSize:
      "11px",

    fontWeight:
      700,

    marginBottom:
      "4px",
  },

  messageText: {
    whiteSpace:
      "pre-wrap",

    lineHeight:
      1.45,
  },

  messageDate: {
    display:
      "block",

    marginTop:
      "7px",

    fontSize:
      "10px",
  },

  systemMessage: {
    textAlign:
      "center",

    color:
      "#777",

    fontSize:
      "12px",

    padding:
      "6px",
  },

  messageForm: {
    padding:
      "16px",

    borderTop:
      "1px solid #eee",
  },

  textarea: {
    width:
      "100%",

    boxSizing:
      "border-box",

    resize:
      "vertical",

    padding:
      "11px",

    border:
      "1px solid #ccc",

    borderRadius:
      "10px",

    fontFamily:
      "inherit",
  },

  sendRow: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginTop:
      "8px",
  },

  counter: {
    color:
      "#888",
  },
};