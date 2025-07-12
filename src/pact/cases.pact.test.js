import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import path from "path";
// The API functions will need to be updated to accept a tenantId.
// We are writing the test first to define that contract.
import { getCaseById, submitDecision } from "../api/cases";

const { eachLike, string, timestamp, integer, like } = MatchersV3;

// This is the required format string for the timestamp matcher.
const ISO_8601_TIMESTAMP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const TENANT_ID = "a4b9a3e6-e6d9-4b2a-9b9a-4e2e1a9e3e1d";
const CASE_ID = "ER-2024-08-124";

// 1. Pact Provider Setup
const provider = new PactV3({
  consumer: "TracerailActionCenter",
  provider: "TracerailAPI",
  dir: path.resolve(process.cwd(), "pact", "pacts"),
  logLevel: "warn",
  pactfileWriteMode: "merge",
});

describe("Cases API Contract Test (Multi-Tenant)", () => {
  test("should handle getting a case and submitting a decision for a specific tenant", () => {
    // 2. Interaction Definition for GET
    provider
      .given(`a case with ID ${CASE_ID} exists for tenant with ID ${TENANT_ID}`)
      .uponReceiving("a request for a single case for a tenant")
      .withRequest({
        method: "GET",
        path: `/api/v1/tenants/${TENANT_ID}/cases/${CASE_ID}`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer test-token-for-${TENANT_ID}`,
        },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        // The body of the response remains the same.
        body: {
          caseDetails: {
            caseId: string(CASE_ID),
            caseTitle: string("Expense Report from John Doe for $750.00"),
            status: string("Pending Agent Approval"),
            assignee: eachLike({ name: string("Jane Smith") }),
            submitter: eachLike({ name: string("John Doe") }),
            createdAt: timestamp(
              ISO_8601_TIMESTAMP_FORMAT,
              "2024-08-21T10:30:00Z",
            ),
            updatedAt: timestamp(
              ISO_8601_TIMESTAMP_FORMAT,
              "2024-08-21T10:35:00Z",
            ),
            caseData: {
              amount: integer(750),
              currency: string("USD"),
              category: string("Travel"),
              ai_summary: string("A summary of the AI analysis."),
              ai_policy_check: string("A policy check result string."),
              ai_risk_score: string("Medium"),
            },
          },
          activityStream: eachLike({
            id: integer(1),
            type: string("system_event"),
            sender: string("System"),
            text: string("Case created and assigned."),
            timestamp: timestamp(
              ISO_8601_TIMESTAMP_FORMAT,
              "2024-08-21T10:30:00Z",
            ),
          }),
          activeInteraction: {
            interactionId: string("approve_request_ER-2024-08-124"),
            interactionType: string("action_buttons"),
            prompt: string("A prompt for the user."),
            payload: {
              actions: eachLike({
                label: string("Approve"),
                value: string("approved"),
                style: string("primary"),
              }),
            },
            submitUrl: string(
              "https://api.tracerail.com/v1/responses/ER-2024-08-124",
            ),
          },
        },
      });

    // 3. Interaction Definition for POST
    provider
      .given(
        `a case with ID ${CASE_ID} is ready for a decision for tenant ${TENANT_ID}`,
      )
      .uponReceiving("a request to submit an 'approved' decision for a tenant")
      .withRequest({
        method: "POST",
        path: `/api/v1/tenants/${TENANT_ID}/cases/${CASE_ID}/decision`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer test-token-for-${TENANT_ID}`,
        },
        body: {
          decision: "approved",
        },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          caseId: string(CASE_ID),
          status: like("Signal Sent"),
          message: like(
            "Decision 'approved' was successfully sent to the case.",
          ),
        },
      });

    // 4. Test Execution
    return provider.executeTest(async (mockServer) => {
      // Test the GET request
      // We assume the API client function will be updated to accept tenantId.
      const caseResponse = await getCaseById(
        TENANT_ID,
        CASE_ID,
        mockServer.url,
      );
      expect(caseResponse.caseDetails.caseId).toBe(CASE_ID);

      // Test the POST request
      const decisionResponse = await submitDecision(
        TENANT_ID,
        CASE_ID,
        "approved",
        mockServer.url,
      );
      expect(decisionResponse.caseId).toBe(CASE_ID);
      expect(decisionResponse.status).toBe("Signal Sent");
    });
  });
});
