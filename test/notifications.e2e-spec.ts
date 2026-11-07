import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";

type NotificationItem = {
  id: string;
  recipient: string;
  channel: string;
  message: string;
  status: string;
};

describe("Notifications Module (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /notifications ────────────────────────────────────────────

  describe("POST /notifications", () => {
    describe("Required fields validation", () => {
      it("should reject request with missing 'recipient' field", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({ channel: "email", message: "Hello" })
          .expect(400);
      });

      it("should reject request with missing 'channel' field", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({ recipient: "user@example.com", message: "Hello" })
          .expect(400);
      });

      it("should reject request with missing 'message' field", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({ recipient: "user@example.com", channel: "email" })
          .expect(400);
      });

      it("should reject request with all required fields missing", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({})
          .expect(400);
      });

      it("should reject request with null required fields", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({ recipient: null, channel: "email", message: "Hello" })
          .expect(400);
      });
    });

    describe("Supported notification channels", () => {
      it("should accept 'email' channel", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: "Test email notification",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should accept 'sms' channel", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "+1234567890",
            channel: "sms",
            message: "Test SMS notification",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should accept 'push' channel", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "device-token-abc",
            channel: "push",
            message: "Test push notification",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should reject unsupported channel 'webhook'", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "https://example.com/callback",
            channel: "webhook",
            message: "Test webhook notification",
          })
          .expect(400);
      });

      it("should reject unsupported channel 'fax'", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "+1234567890",
            channel: "fax",
            message: "Test fax notification",
          })
          .expect(400);
      });

      it("should reject unsupported channel 'mail'", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "mail",
            message: "Test mail notification",
          })
          .expect(400);
      });

      it("should reject channel that is not a string", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: 123,
            message: "Test notification",
          })
          .expect(400);
      });

      it("should reject empty string channel", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "",
            message: "Test notification",
          })
          .expect(400);
      });

      it("should reject case-varied channel 'Email'", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "Email",
            message: "Test notification",
          })
          .expect(400);
      });
    });

    describe("Message validation", () => {
      it("should reject empty message string", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: "",
          })
          .expect(400);
      });

      it("should reject null message", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: null,
          })
          .expect(400);
      });

      it("should reject non-string message", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: 42,
          })
          .expect(400);
      });

      it("should accept valid non-empty message", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: "Hello, this is a valid notification message!",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should accept message with unicode characters", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "push",
            message: "🔔 Notification with emoji: こんにちは 🌍",
          })
          .expect(201);
      });
    });

    describe("Request payload matches API schema", () => {
      it("should accept a fully valid payload matching the schema", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "user@example.com",
            channel: "email",
            message: "Hello, this is a test notification.",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should return error response on validation failure", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({})
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty("message");
            // The OpenAPI validator returns a descriptive error message
            expect(typeof res.body.message).toBe("string");
          });
      });
    });

    describe("Successful creation flow", () => {
      it("should create a notification and return 201 with id and status", () => {
        return request(app.getHttpServer())
          .post("/notifications")
          .send({
            recipient: "newuser@example.com",
            channel: "sms",
            message: "SMS delivery test",
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty("id");
            expect(typeof res.body.id).toBe("string");
            expect(res.body).toHaveProperty("status", "queued");
          });
      });

      it("should generate a unique id for each notification", () => {
        const payloads = [
          {
            recipient: "a@example.com",
            channel: "email" as const,
            message: "Msg1",
          },
          {
            recipient: "b@example.com",
            channel: "sms" as const,
            message: "Msg2",
          },
          {
            recipient: "c@example.com",
            channel: "push" as const,
            message: "Msg3",
          },
        ];

        const promises = payloads.map((p) =>
          request(app.getHttpServer())
            .post("/notifications")
            .send(p)
            .expect(201),
        );

        return Promise.all(promises).then((responses) => {
          const ids = responses.map((r) => r.body.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });
      });
    });
  });

  // ─── GET /notifications ─────────────────────────────────────────────

  describe("GET /notifications", () => {
    it("should return an empty array when no notifications exist", () => {
      return request(app.getHttpServer())
        .get("/notifications")
        .expect(200)
        .expect([]);
    });

    it("should return all created notifications", async () => {
      // Create some notifications first
      await request(app.getHttpServer())
        .post("/notifications")
        .send({
          recipient: "user1@example.com",
          channel: "email",
          message: "First",
        })
        .expect(201);
      await request(app.getHttpServer())
        .post("/notifications")
        .send({
          recipient: "user2@example.com",
          channel: "sms",
          message: "Second",
        })
        .expect(201);

      // Fetch all
      return request(app.getHttpServer())
        .get("/notifications")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it("should return notifications with all expected fields", async () => {
      await request(app.getHttpServer())
        .post("/notifications")
        .send({
          recipient: "full@example.com",
          channel: "push",
          message: "Full payload test",
        })
        .expect(201);

      return request(app.getHttpServer())
        .get("/notifications")
        .expect(200)
        .expect((res) => {
          const notification = (res.body as NotificationItem[]).find(
            (n) => n.recipient === "full@example.com",
          );
          expect(notification).toBeDefined();
          expect(notification).toHaveProperty("id");
          expect(notification).toHaveProperty("recipient");
          expect(notification).toHaveProperty("channel");
          expect(notification).toHaveProperty("message");
          expect(notification).toHaveProperty("status");
        });
    });
  });

  // ─── GET /notifications/:id ─────────────────────────────────────────

  describe("GET /notifications/:id", () => {
    it("should return 404 for a non-existent notification id", () => {
      // Use a valid UUID format so the validator doesn't reject it
      const fakeId = "00000000-0000-4000-8000-000000000000";
      return request(app.getHttpServer())
        .get(`/notifications/${fakeId}`)
        .expect(404)
        .expect((res) => {
          // Service returns undefined for non-existent IDs, NestJS renders as empty object
          expect(res.body).toEqual({
            error: "Not Found",
            message:
              "Notification with ID 00000000-0000-4000-8000-000000000000 not found",
            statusCode: 404,
          });
        });
    });

    it("should return the notification details for a valid id", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/notifications")
        .send({
          recipient: "lookup@example.com",
          channel: "email",
          message: "Lookup test",
        })
        .expect(201);

      const notificationId = createRes.body.id;

      return request(app.getHttpServer())
        .get(`/notifications/${notificationId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", notificationId);
          expect(res.body).toHaveProperty("recipient", "lookup@example.com");
          expect(res.body).toHaveProperty("channel", "email");
          expect(res.body).toHaveProperty("message", "Lookup test");
          expect(res.body).toHaveProperty("status", "queued");
        });
    });

    it("should return all fields when retrieving by id", async () => {
      await request(app.getHttpServer())
        .post("/notifications")
        .send({
          recipient: "fields@example.com",
          channel: "sms",
          message: "Fields check",
        })
        .expect(201);

      return request(app.getHttpServer())
        .get("/notifications")
        .expect(200)
        .expect((res) => {
          const notification = (res.body as NotificationItem[]).find(
            (n) => n.recipient === "fields@example.com",
          );
          expect(notification).toBeDefined();
          // biome-ignore lint/style/noNonNullAssertion: assertion is safe here because we just checked that notification is defined
          expect(Object.keys(notification!)).toEqual(
            expect.arrayContaining([
              "id",
              "recipient",
              "channel",
              "message",
              "status",
            ]),
          );
        });
    });
  });
});
