import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import path from "path";
import { getCaseById, submitDecision } from "../api/cases";

const { eachLike, string, timestamp, integer, like } = MatchersV3;

// This is the required format string for the timestamp matcher.
const ISO_8601_TIMESTAMP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

// 1. Pact Provider Setup
const provider = new PactV3({
  consumer: "TracerailActionCenter",
  provider: "TracerailAPI",
  dir: path.resolve(process.cwd(), "pact", "pacts"),
  logLevel: "warn",
  pactfileWriteMode: "merge",
});

describe("Cases API Contract Test", () => {
  test("should handle getting a case and submitting a decision", () => {
    // 2. Interaction Definition
    provider
      .given("a case with ID ER-2024-08-124 exists")
      .uponReceiving("a request for a single case")
      .withRequest({
        method: "GET",
        path: "/api/v1/cases/ER-2024-08-124",
        headers: { Accept: "application/json" },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          caseDetails: {
            caseId: string("ER-2024-08-124"),
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

    // 3. Test Execution
    provider
      .given("a case with ID ER-2024-08-124 exists")
      .uponReceiving("a request to submit an 'approved' decision")
      .withRequest({
        method: "POST",
        path: "/api/v1/cases/ER-2024-08-124/decision",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: {
          decision: "approved",
        },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          caseId: string("ER-2024-08-124"),
          status: like("Signal Sent"),
          message: like(
            "Decision 'approved' was successfully sent to the case.",
          ),
        },
      });

    return provider.executeTest(async (mockServer) => {
      // Test the GET request
      const caseResponse = await getCaseById("ER-2024-08-124", mockServer.url);
      expect(caseResponse.caseDetails.caseId).toBe("ER-2024-08-124");

      // Test the POST request
      const decisionResponse = await submitDecision(
        "ER-2024-08-124",
        "approved",
        mockServer.url,
      );
      expect(decisionResponse.caseId).toBe("ER-2024-08-124");
      expect(decisionResponse.status).toBe("Signal Sent");
    });
  });
});
