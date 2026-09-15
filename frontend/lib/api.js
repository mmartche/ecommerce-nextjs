import {
  toast,
} from "./toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

function getErrorMessage(
  data,
  status
) {
  if (
    Array.isArray(
      data?.message
    )
  ) {
    return data.message.join(
      ", "
    );
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "You need to login again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "Resource not found.";

    case 409:
      return "This information already exists.";

    case 413:
      return "The uploaded file is too large.";

    case 429:
      return "Too many requests. Please try again shortly.";

    case 500:
      return "An unexpected server error occurred.";

    default:
      return `Request failed (${status}).`;
  }
}

export async function apiFetch(
  path,
  options = {}
) {
  const url =
    path.startsWith(
      "http://"
    ) ||
    path.startsWith(
      "https://"
    )
      ? path
      : `${API_URL}${path}`;

  try {
    const response =
      await fetch(
        url,
        {
          credentials:
            "include",

          ...options,

          headers: {
            ...options.headers,
          },
        }
      );

    let data = null;

    const contentType =
      response.headers.get(
        "content-type"
      );

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      data =
        text
          ? {
              message: text,
            }
          : null;
    }

    if (!response.ok) {
      const message =
        getErrorMessage(
          data,
          response.status
        );

      toast.error(
        message
      );

      const error =
        new Error(message);

      error.status =
        response.status;

      error.data =
        data;

      throw error;
    }

    return data;
  } catch (error) {
    if (
      error.status
    ) {
      throw error;
    }

    console.error(
      "API request failed:",
      error
    );

    toast.error(
      "Unable to connect to the server."
    );

    throw error;
  }
}

export function apiGet(
  path,
  options = {}
) {
  return apiFetch(
    path,
    {
      ...options,
      method: "GET",
    }
  );
}

export function apiPost(
  path,
  body,
  options = {}
) {
  return apiFetch(
    path,
    {
      ...options,

      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...options.headers,
      },

      body:
        JSON.stringify(
          body
        ),
    }
  );
}

export function apiPatch(
  path,
  body,
  options = {}
) {
  return apiFetch(
    path,
    {
      ...options,

      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",

        ...options.headers,
      },

      body:
        JSON.stringify(
          body
        ),
    }
  );
}

export function apiDelete(
  path,
  body,
  options = {}
) {
  return apiFetch(
    path,
    {
      ...options,

      method: "DELETE",

      headers: {
        "Content-Type":
          "application/json",

        ...options.headers,
      },

      body:
        body
          ? JSON.stringify(
              body
            )
          : undefined,
    }
  );
}