# Agent-To API — Bruno

## Import into Bruno
1. Open Bruno.
2. Choose **Import** → **OpenAPI**.
3. Select `bruno/openapi.json` from this repository.
4. Choose a collection name such as **Agent-To API**.

Bruno generates individual requests grouped by API tag from the OpenAPI specification.

## Environment
Use one of the server URLs:
- Production: `https://agent-to.darkube.ir/api/v1`
- Local: `http://localhost:3000/api/v1`

After importing, if Bruno does not expose the server URL as a variable, set a collection/environment variable named `baseUrl` to one of the URLs above and update request URLs to use `{{baseUrl}}`.

## Authentication
1. Run **Auth → Login** with your account.
2. Copy `data.token` from the response.
3. In Bruno, set the collection/environment variable `token` to that JWT.
4. Set Bearer authentication to `{{token}}` for protected requests.

Do not commit real JWTs, Telegram bot tokens, passwords, or installation tokens to Git.

## Suggested variables
- `baseUrl`: `https://agent-to.darkube.ir/api/v1`
- `token`: empty until login
- `siteId`: your public site identifier
- `customerId`: a customer UUID
- `conversationId`: a conversation UUID
- `agentId`: an agent UUID
- `channelId`: an agent-channel UUID
- `installToken`: one-time site installation token
- `telegramBotToken`: secret token from BotFather

## Request order for a basic smoke test
1. System → Health
2. Auth → Login
3. Agent → Get agent (create one first if it does not exist)
4. Agent Channels → Create channel (after agent exists)
5. Sites → List sites
6. Customers → Create customer
7. Conversations → Create conversation
8. AI → Send message

## Important notes
- The public chat gateway is `POST /chat`; it does not use JWT. Required fields: `siteId`, `visitorId`, `message`.
- The Telegram webhook is public by design because Telegram calls it. Do not expose bot tokens in request URLs or logs.
- The admin login sets an HttpOnly cookie. For admin calls in Bruno, you can either allow cookie handling or use the JWT from an admin session if your auth flow returns one.
- Query parameters for usage reports are `from` and `to`; date-range format should match the backend service expectations.
- This spec lists route declarations in the current backend. Request-body examples are starter examples; some advanced modules have additional validation rules.
