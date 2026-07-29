export async function submitHostedForm(endpoint, form, metadata = {}) {
  const formData = new FormData(form);

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.set(key, String(value));
    }
  });

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error("We couldn’t send that right now. Please try again.");
  }

  if (response.ok) return;

  let message = "We couldn’t send that right now. Please try again.";

  try {
    const body = await response.json();
    if (Array.isArray(body?.errors) && body.errors[0]?.message) {
      message = body.errors[0].message;
    } else if (typeof body?.error === "string") {
      message = body.error;
    }
  } catch {
    // Keep the friendly fallback when the endpoint does not return JSON.
  }

  throw new Error(message);
}
