"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

function imageUrl(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${API_URL}${url}`;
}

function createSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  basePrice: "",
  minKeys: 1,
  maxKeys: 52,
  weightGrams: 1,
  pricePerKey: "",
  baseWeightGrams: "",
  weightPerKeyGrams: "",
  active: true,
  colorIds: [],
  fontIds: [],
  images: [],
};

export default function ProductForm({
  product = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);

  const [catalog, setCatalog] =
    useState({
      colors: [],
      fonts: [],
    });

  const [slugEdited, setSlugEdited] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  const [showNewColor, setShowNewColor] = useState(false);
  const [creatingColor, setCreatingColor] = useState(false);
  const [newColor, setNewColor] = useState({
    name: "",
    hex: "#000000",
    filamentCode: "",
  });

  const [showNewFont, setShowNewFont] = useState(false);
  const [creatingFont, setCreatingFont] = useState(false);
  const [newFont, setNewFont] = useState({
    name: "",
    bordered: false,
  });

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!product) {
      return;
    }

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description:
        product.description || "",
      basePrice:
        product.basePrice || "",
      pricePerKey:
        product.pricePerKey ?? "",

      baseWeightGrams:
        product.baseWeightGrams ?? "",
      weightPerKeyGrams:
        product.weightPerKeyGrams ?? "",

      minKeys:
        product.minKeys ?? 1,
      maxKeys:
        product.maxKeys ?? 52,
      active:
        product.active ?? true,
      weightGrams:
        product.weightGrams ?? 1,

      colorIds:
        product.colors?.map(
          (color) => color.id
        ) || [],

      fontIds:
        product.fonts?.map(
          (font) => font.id
        ) || [],

      images:
        product.images?.map(
          (image) => ({
            url: image.url,
            alt: image.alt || "",
          })
        ) || [],
    });

    setSlugEdited(true);
  }, [product]);

  async function loadCatalog() {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/catalog`,
        {
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load catalog"
        );
      }

      setCatalog(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateName(value) {
    setForm((current) => ({
      ...current,

      name: value,

      slug: slugEdited
        ? current.slug
        : createSlug(value),
    }));
  }

  function updateSlug(value) {
    setSlugEdited(true);

    updateField(
      "slug",
      createSlug(value)
    );
  }

  function toggleColor(colorId) {
    setForm((current) => ({
      ...current,

      colorIds:
        current.colorIds.includes(
          colorId
        )
          ? current.colorIds.filter(
            (id) =>
              id !== colorId
          )
          : [
            ...current.colorIds,
            colorId,
          ],
    }));
  }

  function toggleFont(fontId) {
    setForm((current) => ({
      ...current,

      fontIds:
        current.fontIds.includes(
          fontId
        )
          ? current.fontIds.filter(
            (id) =>
              id !== fontId
          )
          : [
            ...current.fontIds,
            fontId,
          ],
    }));
  }

  // function addImage() {
  //   setForm((current) => ({
  //     ...current,

  //     images: [
  //       ...current.images,
  //       {
  //         url: "",
  //         alt: "",
  //       },
  //     ],
  //   }));
  // }

  // function updateImage(
  //   index,
  //   field,
  //   value
  // ) {
  //   setForm((current) => ({
  //     ...current,

  //     images:
  //       current.images.map(
  //         (image, imageIndex) =>
  //           imageIndex === index
  //             ? {
  //               ...image,
  //               [field]: value,
  //             }
  //             : image
  //       ),
  //   }));
  // }

  function removeImage(index) {
    setForm((current) => ({
      ...current,

      images:
        current.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        ),
    }));
  }

  async function uploadImage(
    file
  ) {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/uploads/product-image`,
          {
            method: "POST",

            credentials:
              "include",

            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        const message =
          Array.isArray(
            data.message
          )
            ? data.message.join(
              ", "
            )
            : data.message ||
            data.error ||
            "Upload failed";

        throw new Error(
          message
        );
      }

      setForm(
        (current) => ({
          ...current,

          images: [
            ...current.images,

            {
              url: data.url,
              alt:
                current.name ||
                "Product image",
            },
          ],
        })
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setUploading(false);
    }
  }

  function updateImageAlt(
    index,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        images:
          current.images.map(
            (
              image,
              imageIndex
            ) =>
              imageIndex ===
                index
                ? {
                  ...image,
                  alt: value,
                }
                : image
          ),
      })
    );
  }

  async function createColor() {
    if (!newColor.name.trim()) {
      setError("Color name is required.");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(newColor.hex)) {
      setError("Color must have a valid HEX value.");
      return;
    }

    try {
      setCreatingColor(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/colors`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newColor.name.trim(),
          hex: newColor.hex.toUpperCase(),
          filamentCode: newColor.filamentCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || data.error || "Failed to create color";

        throw new Error(message);
      }

      setCatalog((current) => ({
        ...current,
        colors: [...current.colors, data],
      }));

      setForm((current) => ({
        ...current,
        colorIds: current.colorIds.includes(data.id)
          ? current.colorIds
          : [...current.colorIds, data.id],
      }));

      setNewColor({
        name: "",
        hex: "#000000",
        filamentCode: "",
      });

      setShowNewColor(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setCreatingColor(false);
    }
  }

  async function createFont() {
    if (!newFont.name.trim()) {
      setError("Font name is required.");
      return;
    }

    try {
      setCreatingFont(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/fonts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFont.name.trim(),
          bordered: Boolean(newFont.bordered),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || data.error || "Failed to create font";

        throw new Error(message);
      }

      setCatalog((current) => ({
        ...current,
        fonts: [...current.fonts, data],
      }));

      setForm((current) => ({
        ...current,
        fontIds: current.fontIds.includes(data.id)
          ? current.fontIds
          : [...current.fontIds, data.id],
      }));

      setNewFont({
        name: "",
        bordered: false,
      });

      setShowNewFont(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setCreatingFont(false);
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),

        description:
          form.description.trim(),

        basePrice:
          Number(form.basePrice),

        pricePerKey:
          Number(form.pricePerKey),

        baseWeightGrams:
          Number(form.baseWeightGrams),

        weightPerKeyGrams:
          Number(form.weightPerKeyGrams),

        minKeys:
          Number(form.minKeys),

        maxKeys:
          Number(form.maxKeys),

        active:
          Boolean(form.active),

        weightGrams:
          Number(form.weightGrams),

        colorIds:
          form.colorIds,

        fontIds:
          form.fontIds,

        images:
          form.images
            .filter(
              (image) =>
                image.url.trim()
            )
            .map((image) => ({
              url:
                image.url.trim(),

              alt:
                image.alt.trim(),
            })),
      };

      const isEditing =
        Boolean(product?.id);

      const url = isEditing
        ? `${API_URL}/api/admin/products/${product.id}`
        : `${API_URL}/api/admin/products`;

      const response =
        await fetch(url, {
          method: isEditing
            ? "PATCH"
            : "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        const message =
          Array.isArray(
            data.message
          )
            ? data.message.join(
              ", "
            )
            : data.message ||
            data.error ||
            "Failed to save product";

        throw new Error(
          message
        );
      }

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={styles.form}
    >
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section style={styles.card}>
        <h2>
          Product information
        </h2>

        <label style={styles.label}>
          Name

          <input
            value={form.name}
            onChange={(event) =>
              updateName(
                event.target.value
              )
            }
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Slug

          <input
            value={form.slug}
            onChange={(event) =>
              updateSlug(
                event.target.value
              )
            }
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Description

          <textarea
            value={
              form.description
            }
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            required
            rows={7}
            style={
              styles.textarea
            }
          />
        </label>

        <label style={styles.label}>
          Weight Grams

          <input
            type="number"
            min="0"
            step="1"
            value={
              form.weightGrams
            }
            onChange={(event) =>
              updateField(
                "weightGrams",
                event.target.value
              )
            }
            required
            style={styles.input}
          />
        </label>
      </section>

      <section style={styles.card}>
        <h2>
          Pricing & configuration
        </h2>

        <div style={styles.grid}>
          <label style={styles.label}>
            Base price (€)

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.basePrice
              }
              onChange={(event) =>
                updateField(
                  "basePrice",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Minimum keys

            <input
              type="number"
              min="1"
              value={form.minKeys}
              onChange={(event) =>
                updateField(
                  "minKeys",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Maximum keys

            <input
              type="number"
              min="1"
              value={form.maxKeys}
              onChange={(event) =>
                updateField(
                  "maxKeys",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>
          <br />
          <label style={styles.label}>
            Price per key (€)

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerKey}
              onChange={(event) =>
                updateField(
                  "pricePerKey",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Base weight (g)

            <input
              type="number"
              min="0"
              value={form.baseWeightGrams}
              onChange={(event) =>
                updateField(
                  "baseWeightGrams",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Weight per key (g)

            <input
              type="number"
              min="0"
              value={form.weightPerKeyGrams}
              onChange={(event) =>
                updateField(
                  "weightPerKeyGrams",
                  event.target.value
                )
              }
              required
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              updateField(
                "active",
                event.target.checked
              )
            }
          />

          Product active
        </label>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2>Colors</h2>

          <button
            type="button"
            onClick={() => setShowNewColor((current) => !current)}
            style={styles.secondaryButton}
          >
            {showNewColor ? "Cancel new color" : "+ New color"}
          </button>
        </div>

        {showNewColor && (
          <div style={styles.inlineEditor}>
            <label style={styles.label}>
              Color name

              <input
                value={newColor.name}
                onChange={(event) =>
                  setNewColor((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Matte Marine Blue"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              HEX

              <div style={styles.colorInputRow}>
                <input
                  type="color"
                  value={newColor.hex}
                  onChange={(event) =>
                    setNewColor((current) => ({
                      ...current,
                      hex: event.target.value,
                    }))
                  }
                  style={styles.colorPicker}
                />

                <input
                  value={newColor.hex}
                  onChange={(event) =>
                    setNewColor((current) => ({
                      ...current,
                      hex: event.target.value,
                    }))
                  }
                  placeholder="#000000"
                  style={styles.input}
                />
              </div>
            </label>

            <label style={styles.label}>
              Filament code

              <input
                value={newColor.filamentCode}
                onChange={(event) =>
                  setNewColor((current) => ({
                    ...current,
                    filamentCode: event.target.value,
                  }))
                }
                placeholder="11600"
                style={styles.input}
              />
            </label>

            <button
              type="button"
              onClick={createColor}
              disabled={creatingColor}
              style={styles.primaryButton}
            >
              {creatingColor ? "Adding..." : "Add color"}
            </button>
          </div>
        )}

        <div style={styles.options}>
          {catalog.colors.map((color) => (
            <label key={color.id} style={styles.option}>
              <input
                type="checkbox"
                checked={form.colorIds.includes(color.id)}
                onChange={() => toggleColor(color.id)}
              />

              <span
                style={{
                  ...styles.color,
                  background: color.hex,
                }}
              />

              <span>
                {color.name}
                {color.filamentCode ? ` (${color.filamentCode})` : ""}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2>Fonts</h2>

          <button
            type="button"
            onClick={() => setShowNewFont((current) => !current)}
            style={styles.secondaryButton}
          >
            {showNewFont ? "Cancel new font" : "+ New font"}
          </button>
        </div>

        {showNewFont && (
          <div style={styles.inlineEditor}>
            <label style={styles.label}>
              Font name

              <input
                value={newFont.name}
                onChange={(event) =>
                  setNewFont((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Montserrat"
                style={styles.input}
              />
            </label>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={newFont.bordered}
                onChange={(event) =>
                  setNewFont((current) => ({
                    ...current,
                    bordered: event.target.checked,
                  }))
                }
              />

              With border
            </label>

            <button
              type="button"
              onClick={createFont}
              disabled={creatingFont}
              style={styles.primaryButton}
            >
              {creatingFont ? "Adding..." : "Add font"}
            </button>
          </div>
        )}

        <div style={styles.options}>
          {catalog.fonts.map((font) => (
            <label key={font.id} style={styles.option}>
              <input
                type="checkbox"
                checked={form.fontIds.includes(font.id)}
                onChange={() => toggleFont(font.id)}
              />

              <span>
                {font.name}
                {" — "}
                {font.bordered ? "With border" : "Without border"}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* <section style={styles.card}>
        <div
          style={
            styles.sectionHeader
          }
        >
          <h2>Images</h2>

          <button
            type="button"
            onClick={addImage}
          >
            + Add image
          </button>
        </div>

        {form.images.length ===
          0 && (
            <p style={styles.muted}>
              No images added.
            </p>
          )}

        {form.images.map(
          (image, index) => (
            <div
              key={index}
              style={
                styles.imageRow
              }
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Image URL

                  <input
                    value={
                      image.url
                    }
                    onChange={(
                      event
                    ) =>
                      updateImage(
                        index,
                        "url",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="http://..."
                    style={
                      styles.input
                    }
                  />
                </label>

                <label
                  style={
                    styles.label
                  }
                >
                  Alt text

                  <input
                    value={
                      image.alt
                    }
                    onChange={(
                      event
                    ) =>
                      updateImage(
                        index,
                        "alt",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      styles.input
                    }
                  />
                </label>
              </div>

              {image.url && (
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    "Preview"
                  }
                  style={
                    styles.preview
                  }
                />
              )}

              <button
                type="button"
                onClick={() =>
                  removeImage(
                    index
                  )
                }
              >
                Remove
              </button>
            </div>
          )
        )}
      </section> */}
      <section style={styles.card}>
        <div
          style={
            styles.sectionHeader
          }
        >
          <div>
            <h2>Images</h2>

            <p style={styles.muted}>
              JPG, PNG or WEBP.
              Maximum 5 MB.
            </p>
          </div>

          <label
            style={
              styles.uploadButton
            }
          >
            {uploading
              ? "Uploading..."
              : "+ Upload image"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={
                uploading
              }
              onChange={(
                event
              ) => {
                const file =
                  event.target
                    .files?.[0];

                uploadImage(
                  file
                );

                event.target.value =
                  "";
              }}
              style={{
                display: "none",
              }}
            />
          </label>
        </div>

        {form.images.length ===
          0 && (
            <p style={styles.muted}>
              No images uploaded.
            </p>
          )}

        <div
          style={
            styles.imageGrid
          }
        >
          {form.images.map(
            (
              image,
              index
            ) => (
              <div
                key={`${image.url}-${index}`}
                style={
                  styles.imageCard
                }
              >
                <img
                  src={imageUrl(
                    image.url
                  )}
                  alt={
                    image.alt ||
                    "Product preview"
                  }
                  style={
                    styles.bigPreview
                  }
                />

                <label
                  style={
                    styles.label
                  }
                >
                  Alt text

                  <input
                    value={
                      image.alt
                    }
                    onChange={(
                      event
                    ) =>
                      updateImageAlt(
                        index,
                        event.target
                          .value
                      )
                    }
                    style={
                      styles.input
                    }
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    removeImage(
                      index
                    )
                  }
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>
      </section>

      <div style={styles.footer}>
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/products"
            )
          }
          style={
            styles.secondaryButton
          }
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          style={
            styles.primaryButton
          }
        >
          {saving
            ? "Saving..."
            : product
              ? "Save changes"
              : "Create product"}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: "grid",
    gap: "20px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "24px",
  },

  label: {
    display: "grid",
    gap: "7px",
    marginBottom: "16px",
    fontWeight: "600",
  },

  input: {
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
  },

  textarea: {
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    resize: "vertical",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
  },

  checkbox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  options: {
    display: "grid",
    gap: "10px",
  },

  option: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  color: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "1px solid #aaa",
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
  },

  imageRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px 0",
    borderBottom:
      "1px solid #eee",
  },

  preview: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  footer: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
  },

  primaryButton: {
    background: "#111",
    color: "#fff",
    border: 0,
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  secondaryButton: {
    background: "#fff",
    border: "1px solid #ccc",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  error: {
    background: "#fff2f2",
    border: "1px solid #f1b1b1",
    padding: "14px",
    borderRadius: "8px",
    color: "#a00000",
  },

  muted: {
    color: "#777",
  },
  uploadButton: {
    display: "inline-block",
    background: "#111",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  inlineEditor: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    alignItems: "end",
    gap: "14px",
    marginBottom: "20px",
    padding: "16px",
    border: "1px solid #eee",
    borderRadius: "10px",
    background: "#fafafa",
  },

  colorInputRow: {
    display: "grid",
    gridTemplateColumns: "52px 1fr",
    gap: "10px",
    alignItems: "center",
  },

  colorPicker: {
    width: "52px",
    height: "42px",
    padding: "2px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  imageCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "12px",
  },

  bigPreview: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "12px",
  },
};