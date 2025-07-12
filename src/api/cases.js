/**
 * @file This file contains the service layer for all API calls related to Cases.
 * It abstracts away the network communication logic from the UI components.
 */

// Use an environment variable for the base API URL, with a sensible default for development.
// This will be overridden by the mock server URL during contract testing.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Fetches a single case by its ID by making a real network request.
 *
 * @param {string} caseId - The ID of the case to fetch.
 * @param {string} [baseUrl] - (Optional) The base URL for the API endpoint.
 *                             This is used by tests to point to the Pact mock server.
 *                             If not provided, it defaults to the main API URL.
 * @returns {Promise<object>} A promise that resolves to the full case object,
 *                            containing caseDetails, activityStream, and activeInteraction.
 */
export const getCaseById = async (caseId, baseUrl = API_BASE_URL) => {
  const url = `${baseUrl}/api/v1/cases/${caseId}`;
  console.log(`[API Service] Fetching case from: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // In a real application, an Authorization header would be added here, e.g.:
      // 'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    // If the server response is not successful (e.g., 404, 500),
    // throw an error to be caught by the calling component.
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  // Parse the JSON from the response body and return it.
  const data = await response.json();
  console.log("[API Service] Data returned for case:", caseId);
  return data;
};

/**
 * Submits a decision for a specific case.
 *
 * @param {string} caseId - The ID of the case to submit the decision for.
 * @param {string} decision - The decision value (e.g., "approved", "rejected").
 * @returns {Promise<object>} A promise that resolves to the confirmation response from the API.
 */
export const submitDecision = async (
  caseId,
  decision,
  baseUrl = API_BASE_URL,
) => {
  const url = `${baseUrl}/api/v1/cases/${caseId}/decision`;
  console.log(`[API Service] Submitting decision '${decision}' to: ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // In a real application, an Authorization header would be added here
    },
    body: JSON.stringify({ decision }),
  });

  if (!response.ok) {
    // If the server response is not successful, throw an error to be
    // caught by the calling UI component.
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  // Parse the JSON from the response body and return it.
  const data = await response.json();
  console.log("[API Service] Received confirmation for decision:", data);
  return data;
};
