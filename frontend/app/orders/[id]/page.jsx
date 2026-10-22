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
  apiPost,
} from "@/lib/api";

import {
  useAuth,
} from "../../../context/AuthContext";

import {
  useTranslations,
} from "next-intl";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function OrderDetailsPage() {
  const params =
    useParams();

  const orderId =
    params.id;

  const t =
    useTranslations(
      "OrderDetails"
    );

  const {
    user,
    loading:
    authLoading,
  } = useAuth();

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
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function loadOrder() {
    const data =
      await apiGet(
        `${API_URL}/api/orders/${orderId}`
      );

    setOrder(data);
  }

  async function loadMessages() {
    const data =
      await apiGet(
        `${API_URL}/api/orders/${orderId}/messages`
      );

    setMessages(
      Array.isArray(data)
        ? data
        : []
    );
  }

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !orderId
    ) {
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
          t("loadError")
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [
    authLoading,
    user,
    orderId,
  ]);

  /*
   * Atualiza o histórico
   * automaticamente.
   */
  useEffect(() => {
    if (
      !user ||
      !orderId
    ) {
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
    user,
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

      await apiPost(
        `${API_URL}/api/orders/${orderId}/messages`,
        {
          message:
            cleanMessage,
        }
      );

      setMessage("");

      await loadMessages();
    } catch (error) {
      console.error(error);

      setError(
        t("sendError")
      );
    } finally {
      setSending(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main
        style={
          styles.container
        }
      >
        {t("loading")}
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={
          styles.container
        }
      >
        {t(
          "loginRequired"
        )}
      </main>
    );
  }

  if (
    error &&
    !order
  ) {
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
          {error}
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
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
            {t("order")}
          </div>

          <h1
            style={
              styles.title
            }
          >
            #{order.id}
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
            styles.status
          }
        >
          {t(
            `status.${order.status}`,
            {
              fallback:
                order.status,
            }
          )}
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

      <div
        style={
          styles.layout
        }
      >
        {/* ORDER */}

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
              {t("items")}
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
                        {t(
                          "quantity"
                        )}
                        :{" "}
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
                          {t(
                            "keys"
                          )}
                          :{" "}
                          {
                            item.keys
                          }
                        </div>
                      )}

                      {item.colorName && (
                        <div
                          style={
                            styles.itemMeta
                          }
                        >
                          {t(
                            "color"
                          )}
                          :{" "}
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
                          {t(
                            "font"
                          )}
                          :{" "}
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
                label={
                  t("subtotal")
                }
                value={`€${Number(
                  order.subtotal ||
                  0
                ).toFixed(2)}`}
              />

              <SummaryRow
                label={
                  t("shipping")
                }
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
                  {t("total")}
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
              {t(
                "deliveryAddress"
              )}
            </h2>

            <div
              style={
                styles.address
              }
            >
              <strong>
                {
                  order.shippingName
                }
              </strong>

              <span>
                {
                  order.shippingAddress
                }
              </span>

              <span>
                {
                  order.shippingPostalCode
                }{" "}
                {
                  order.shippingCity
                }
              </span>

              <span>
                {
                  order.shippingCountry
                }
              </span>
            </div>
          </section>
        </div>

        {/* HISTORY */}

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
            <div>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "history"
                )}
              </h2>

              <p
                style={
                  styles.chatSubtitle
                }
              >
                {t(
                  "historyDescription"
                )}
              </p>
            </div>
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
                  {t(
                    "noMessages"
                  )}
                </div>
              )}

            {messages.map(
              (item) => (
                <Message
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  t={t}
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
              placeholder={
                t(
                  "messagePlaceholder"
                )
              }
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
                  ...styles.sendButton,

                  opacity:
                    sending ||
                      !message.trim()
                      ? 0.5
                      : 1,
                }}
              >
                {sending
                  ? t(
                    "sending"
                  )
                  : t(
                    "send"
                  )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Message({
  item,
  t,
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
            ? `${t(
              "statusChanged"
            )}: ${t(
              `status.${item.message}`,
              {
                fallback:
                  item.message,
              }
            )}`
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

  const customer =
    item.authorType ===
    "CUSTOMER";

  return (
    <div
      style={{
        ...styles.messageRow,

        justifyContent:
          customer
            ? "flex-end"
            : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.messageBubble,

          background:
            customer
              ? "#111"
              : "#f1f1f1",

          color:
            customer
              ? "#fff"
              : "#111",
        }}
      >
        <div
          style={
            styles.messageAuthor
          }
        >
          {customer
            ? t("you")
            : t("seller")}
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
              customer
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
      "1200px",

    margin:
      "0 auto",

    padding:
      "48px 20px 80px",
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
      "30px",
  },

  eyebrow: {
    color:
      "#777",

    fontSize:
      "13px",

    textTransform:
      "uppercase",
  },

  title: {
    margin:
      "4px 0",

    fontSize:
      "36px",
  },

  date: {
    color:
      "#777",

    fontSize:
      "13px",
  },

  status: {
    padding:
      "8px 13px",

    background:
      "#f2f2f2",

    borderRadius:
      "20px",

    fontSize:
      "13px",

    fontWeight:
      600,
  },

  layout: {
    display:
      "grid",

    gridTemplateColumns:
      "minmax(0, 1fr) minmax(340px, 430px)",

    gap:
      "30px",

    alignItems:
      "start",
  },

  card: {
    padding:
      "24px",

    border:
      "1px solid #e4e4e4",

    borderRadius:
      "16px",

    marginBottom:
      "20px",
  },

  sectionTitle: {
    margin:
      "0 0 18px",

    fontSize:
      "20px",
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

  address: {
    display:
      "grid",

    gap:
      "6px",
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
      "470px",

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

    textAlign:
      "center",
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

    border:
      "1px solid #ccc",

    borderRadius:
      "10px",

    padding:
      "11px",

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

  sendButton: {
    border:
      "none",

    borderRadius:
      "9px",

    padding:
      "10px 18px",

    background:
      "#111",

    color:
      "#fff",

    fontWeight:
      600,

    cursor:
      "pointer",
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
};