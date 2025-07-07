import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import path from "path";
import { getCaseById } from "../api/cases";

const { eachLike, string, timestamp, integer } = MatchersV3;

// This is the required format string for the timestamp matcher.
const ISO_8601_TIMESTAMP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

// 1. Pact Provider Setup
const provider = new PactV3({
  consumer: "TracerailActionCenter",
  provider: "TracerailAPI",
  dir: path.resolve(process.cwd(), "pact", "pacts"),
  logLevel: "warn",
});

describe("Cases API Contract Test", () => {
  describe("when a request is made to get a single case", () => {
    test("should return the full case object if the case exists", () => {
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
      return provider.executeTest(async (mockServer) => {
        const caseResponse = await getCaseById(
          "ER-2024-08-124",
          mockServer.url,
        );

        // 4. Assertions
        expect(caseResponse.caseDetails.caseId).toBe("ER-2024-08-124");
        expect(caseResponse.activityStream).toBeInstanceOf(Array);
        expect(caseResponse.activeInteraction.interactionType).toBe(
          "action_buttons",
        );
      });
    });
  });
});
