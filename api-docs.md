# My AI Agent API Documentation

**Base URL:** `http://localhost:3000/api/v1`

## Authentication

All endpoints (except `/auth/register`, `/auth/login`, `/sites/install`, and `/sites/install/script`) require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <JWT_TOKEN>
```

### JWT Payload

| Field     | Type   | Description          |
|-----------|--------|----------------------|
| `userId`  | string | User UUID            |
| `tenantId`| string | Tenant UUID          |
| `email`   | string | User email address   |
| `role`    | string | `SUPER_ADMIN` \| `ADMIN` \| `STAFF` |

---

## Table of Contents

- [Health](#health)
- [Chat (Public Gateway)](#chat-public-gateway)
- [Chat Settings](#chat-settings)
- [Auth](#auth)
- [Sites](#sites)
- [Knowledge](#knowledge)
- [Customers](#customers)
- [Conversations](#conversations)
- [Messages](#messages)
- [AI](#ai)
- [Leads](#leads)
- [Agents](#agents)

---

## Health

### `GET /api/v1/health`

Returns server health status.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "My AI Agent API is running 🚀",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Chat (Public Gateway)

### `POST /api/v1/chat`

Public chat gateway for website visitors. Resolves site by `siteId`, creates/finds customer and conversation, then sends the message to AI.

**No authentication required.**

**Request Body:**

| Field        | Type   | Required | Description                                      |
|--------------|--------|----------|--------------------------------------------------|
| `siteId`     | string | yes      | Site identifier (short code, e.g. "myshop")      |
| `visitorId`  | string | yes      | Unique visitor identifier                        |
| `message`    | string | yes      | Visitor message text                             |
| `channel`    | string | no       | `WEBSITE` \| `WORDPRESS` \| `TELEGRAM` \| `WHATSAPP` (default: `WEBSITE`) |
| `username`   | string | no       | Visitor username                                 |
| `firstName`  | string | no       | Visitor first name                               |
| `lastName`   | string | no       | Visitor last name                                |
| `phone`      | string | no       | Visitor phone number                             |
| `email`      | string | no       | Visitor email                                    |

**Responses:**

`200 OK`
```json
{
  "success": true,
  "siteId": "myshop",
  "customerId": "uuid",
  "conversationId": "uuid",
  "message": "We ship worldwide within 3-5 business days."
}
```

`400 Bad Request` — Missing required fields
`404 Not Found` — Site not found or inactive
`500 Internal Server Error`

---

## Chat Settings

### `GET /api/v1/sites/:id/chat-settings`

Get chat widget settings for a site (CRM/authenticated).

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Site UUID

**Response:** `200 OK`
```json
{
  "success": true,
  "site": {
    "id": "uuid",
    "siteId": "myshop",
    "domain": "myshop.example.com",
    "name": "My Shop",
    "status": "ACTIVE"
  },
  "settings": {
    "id": "uuid",
    "siteId": "uuid",
    "logoUrl": null,
    "primaryColor": "#10706B",
    "welcomeTitle": "سلام 👋",
    "welcomeMessage": "چطور می‌توانیم کمکتان کنیم؟",
    "onlineLabel": "آنلاین",
    "responseTimeText": "معمولاً کمتر از ۲ دقیقه",
    "phone": null,
    "address": null,
    "inputPlaceholder": "پیام خود را بنویسید...",
    "footerText": null,
    "showPhone": true,
    "showAddress": true,
    "showFooter": true,
    "quickActions": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Site not found
`500 Internal Server Error`

---

### `PATCH /api/v1/sites/:id/chat-settings`

Update chat widget settings for a site.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Site UUID

**Request Body** (all fields optional):

| Field             | Type    | Description                                  |
|-------------------|---------|----------------------------------------------|
| `logoUrl`         | string  | Logo image URL                               |
| `primaryColor`    | string  | Primary color hex (e.g. `#10706B`)           |
| `welcomeTitle`    | string  | Welcome title                                |
| `welcomeMessage`  | string  | Welcome message                              |
| `onlineLabel`     | string  | Online status label                          |
| `responseTimeText`| string  | Expected response time text                  |
| `phone`           | string  | Business phone number                        |
| `address`         | string  | Business address                             |
| `inputPlaceholder`| string  | Chat input placeholder                       |
| `footerText`      | string  | Footer text                                  |
| `showPhone`       | boolean | Show phone in widget                         |
| `showAddress`     | boolean | Show address in widget                       |
| `showFooter`      | boolean | Show footer in widget                        |
| `quickActions`    | array   | Quick action buttons (string array)          |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat settings updated successfully",
  "site": { ... },
  "settings": { ... }
}
```

`401 Unauthorized`
`404 Not Found` — Site not found
`500 Internal Server Error`

---

### `GET /api/v1/public/sites/:siteId/config`

Public chat widget config for frontend embedding. **No authentication.**

**Params:** `siteId` — Site short code (e.g. "myshop")

**Response:** `200 OK`
```json
{
  "success": true,
  "site": {
    "id": "uuid",
    "siteId": "myshop",
    "domain": "myshop.example.com",
    "name": "My Shop",
    "status": "ACTIVE"
  },
  "settings": {
    "logoUrl": null,
    "primaryColor": "#10706B",
    "welcomeTitle": "سلام 👋",
    "welcomeMessage": "چطور می‌توانیم کمکتان کنیم؟",
    "onlineLabel": "آنلاین",
    "responseTimeText": "معمولاً کمتر از ۲ دقیقه",
    "phone": null,
    "address": null,
    "inputPlaceholder": "پیام خود را بنویسید...",
    "footerText": null,
    "showPhone": true,
    "showAddress": true,
    "showFooter": true,
    "quickActions": []
  }
}
```

`404 Not Found` — Site not found
`500 Internal Server Error`

---

## Auth

### `POST /api/v1/auth/register`

Register a new user and tenant.

**Request Body:**

| Field        | Type   | Required | Description          |
|--------------|--------|----------|----------------------|
| `email`      | string | yes      | User email (unique)  |
| `password`   | string | yes      | User password        |
| `firstName`  | string | yes      | User first name      |
| `lastName`   | string | yes      | User last name       |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "msg": "کاربر با موفقت ثبت نام شد",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "isEmailVerified": false,
    "lastLogin": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing required fields
`409 Conflict` — Email already exists
`500 Internal Server Error`

---

### `POST /api/v1/auth/login`

Authenticate and receive JWT token.

**Request Body:**

| Field      | Type   | Required | Description       |
|------------|--------|----------|-------------------|
| `email`    | string | yes      | User email        |
| `password` | string | yes      | User password     |

**Responses:**

`200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "tenantId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF"
    }
  }
}
```

`400 Bad Request` — Missing email or password
`401 Unauthorized` — Invalid email or password
`500 Internal Server Error`

---

### `GET /api/v1/auth/me`

Get authenticated user info.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "isEmailVerified": false,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — User not found
`500 Internal Server Error`

---

## Sites

### `POST /api/v1/sites`

Create a new site for the authenticated tenant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field    | Type   | Required | Description                  |
|----------|--------|----------|------------------------------|
| `siteId` | string | yes      | Site identifier (unique)     |
| `domain` | string | yes      | Site domain                  |
| `name`   | string | yes      | Site display name            |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Site created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "siteId": "myshop",
    "domain": "myshop.example.com",
    "name": "My Shop",
    "status": "INSTALLING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing required fields
`401 Unauthorized`
`409 Conflict` — Site ID already exists
`500 Internal Server Error`

---

### `GET /api/v1/sites`

List all sites for the authenticated tenant.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "siteId": "myshop",
      "domain": "myshop.example.com",
      "name": "My Shop",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/v1/sites/:id/install`

Create an installation token for a specific site.

**Headers:** `Authorization: Bearer <token>`

**Params:**

| Name | Type   | Description       |
|------|--------|-------------------|
| `id` | string | Site UUID         |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Installation token created successfully",
  "data": {
    "token": "abc123xyz",
    "siteId": "uuid",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Site not found
`500 Internal Server Error`

---

### `POST /api/v1/sites/install`

Complete installation using an installation token. **Public** (no auth).

**Request Body:**

| Field   | Type   | Required | Description                |
|---------|--------|----------|----------------------------|
| `token` | string | yes      | Installation token         |

**Responses:**

`200 OK`
```json
{
  "success": true,
  "message": "Installation completed successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "siteId": "myshop",
    "domain": "myshop.example.com",
    "name": "My Shop",
    "status": "ACTIVE"
  }
}
```

`400 Bad Request` — Token required
`401 Unauthorized` — Invalid token
`409 Conflict` — Token already used
`410 Gone` — Token expired
`404 Not Found` — Site not found
`500 Internal Server Error`

---

### `GET /api/v1/sites/install/script?token=<token>`

Download a bash installation script for a site. **Public** (no auth).

**Query Parameters:**

| Name    | Type   | Required | Description          |
|---------|--------|----------|----------------------|
| `token` | string | yes      | Installation token   |

**Responses:**

`200 OK` — Returns `text/plain` bash script

`400 Bad Request` — Token required (plain text)
`401 Unauthorized` — Invalid token (plain text)
`409 Conflict` — Token already used (plain text)
`410 Gone` — Token expired (plain text)
`404 Not Found` — Site not found (plain text)
`500 Internal Server Error` — (plain text)

---

## Knowledge

All endpoints require authentication.

### `POST /api/v1/knowledge`

Create a knowledge base entry.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field    | Type   | Required | Description                                  |
|----------|--------|----------|----------------------------------------------|
| `title`  | string | yes      | Knowledge title                              |
| `content`| string | yes      | Knowledge content                            |
| `type`   | string | no       | `TEXT` \| `FAQ` \| `PRODUCT` \| `DOCUMENT` \| `URL` (default: `TEXT`) |
| `source` | string | no       | Source URL or reference                      |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "title": "Shipping Policy",
    "content": "We ship worldwide within 3-5 days.",
    "type": "TEXT",
    "source": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing title or content
`401 Unauthorized`
`500 Internal Server Error`

---

### `GET /api/v1/knowledge`

List all active knowledge entries for the tenant.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "title": "Shipping Policy",
      "content": "We ship worldwide within 3-5 days.",
      "type": "PRODUCT",
      "source": "https://docs.example.com/shipping",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/v1/knowledge/:id`

Get a single knowledge entry by ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Knowledge entry UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "title": "Shipping Policy",
    "content": "We ship worldwide within 3-5 days.",
    "type": "TEXT",
    "source": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Knowledge not found
`500 Internal Server Error`

---

### `DELETE /api/v1/knowledge/:id`

Delete a knowledge entry.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Knowledge entry UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Knowledge deleted successfully"
}
```

`401 Unauthorized`
`404 Not Found` — Knowledge not found
`500 Internal Server Error`

---

## Customers

All endpoints require authentication.

### `POST /api/v1/customers`

Create a new customer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field        | Type   | Required | Description                          |
|--------------|--------|----------|--------------------------------------|
| `firstName`  | string | no*      | Customer first name                  |
| `lastName`   | string | no*      | Customer last name                   |
| `phone`      | string | no*      | Customer phone number                |
| `email`      | string | no*      | Customer email                       |
| `telegramId` | string | no       | Telegram user ID                     |
| `username`   | string | no       | Telegram/social username             |
| `referredBy` | string | no       | Referral code of referring customer  |

*At least one identity field (`firstName`, `lastName`, `phone`, or `email`) is required.

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "telegramId": "",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "referralCode": "a1b2c3d4-...",
    "referredBy": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — At least one identity field required
`401 Unauthorized`
`500 Internal Server Error`

---

### `GET /api/v1/customers`

List all customers for the tenant.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "telegramId": "123456789",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "referralCode": "a1b2c3d4-...",
      "referredBy": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/v1/customers/:id`

Get a single customer by ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Customer UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "telegramId": "123456789",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "referralCode": "a1b2c3d4-...",
    "referredBy": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Customer not found
`500 Internal Server Error`

---

## Conversations

All endpoints require authentication.

### `POST /api/v1/conversations`

Create a new conversation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field        | Type   | Required | Description                             |
|--------------|--------|----------|-----------------------------------------|
| `customerId` | string | yes      | Customer UUID                           |
| `channel`    | string | yes      | `WEBSITE` \| `WORDPRESS` \| `TELEGRAM` \| `WHATSAPP` |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "channel": "WEBSITE",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing customerId or channel
`401 Unauthorized`
`404 Not Found` — Customer not found
`500 Internal Server Error`

---

### `GET /api/v1/conversations`

List all conversations for the tenant.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "customerId": "uuid",
      "channel": "WEBSITE",
      "status": "OPEN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/v1/conversations/:id`

Get a single conversation by ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Conversation UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "channel": "WEBSITE",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Conversation not found
`500 Internal Server Error`

---

### `PATCH /api/v1/conversations/:id/status`

Update a conversation's status.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Conversation UUID

**Request Body:**

| Field    | Type   | Required | Description          |
|----------|--------|----------|----------------------|
| `status` | string | yes      | `OPEN` \| `CLOSED`   |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Conversation status updated successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "channel": "WEBSITE",
    "status": "CLOSED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing status
`401 Unauthorized`
`404 Not Found` — Conversation not found
`500 Internal Server Error`

---

## Messages

All endpoints require authentication.

### `POST /api/v1/messages`

Create a new message in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field           | Type   | Required | Description                                |
|-----------------|--------|----------|--------------------------------------------|
| `conversationId`| string | yes      | Conversation UUID                          |
| `sender`        | string | yes      | `USER` \| `AI` \| `AGENT` \| `SYSTEM`      |
| `content`       | string | yes      | Message content                            |
| `messageType`   | string | no       | `TEXT` \| `IMAGE` \| `FILE` (default: `TEXT`) |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "conversationId": "uuid",
    "sender": "USER",
    "content": "Hello, how are you?",
    "messageType": "TEXT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing required fields
`401 Unauthorized`
`404 Not Found` — Conversation not found
`500 Internal Server Error`

---

### `GET /api/v1/messages/conversation/:conversationId`

List all messages in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Params:** `conversationId` — Conversation UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "conversationId": "uuid",
      "sender": "USER",
      "content": "Hello, how are you?",
      "messageType": "TEXT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "tenantId": "uuid",
      "conversationId": "uuid",
      "sender": "AI",
      "content": "I'm doing well, thank you!",
      "messageType": "TEXT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

`401 Unauthorized`
`404 Not Found` — Conversation not found
`500 Internal Server Error`

---

### `GET /api/v1/messages/:id`

Get a single message by ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Message UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "conversationId": "uuid",
    "sender": "USER",
    "content": "Hello, how are you?",
    "messageType": "TEXT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Message not found
`500 Internal Server Error`

---

## AI

All endpoints require authentication.

### `POST /api/v1/ai/chat`

Send a message to the AI and receive a response. Uses knowledge base search and conversation history for context.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field           | Type   | Required | Description                      |
|-----------------|--------|----------|----------------------------------|
| `conversationId`| string | yes      | Conversation UUID                |
| `message`       | string | yes      | User message text                |

**Responses:**

`200 OK`
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "tenantId": "uuid",
      "conversationId": "uuid",
      "sender": "USER",
      "content": "What are your shipping times?",
      "messageType": "TEXT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "aiMessage": {
      "id": "uuid",
      "tenantId": "uuid",
      "conversationId": "uuid",
      "sender": "AI",
      "content": "We ship worldwide within 3-5 business days.",
      "messageType": "TEXT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "history": [
      {
        "id": "uuid",
        "tenantId": "uuid",
        "conversationId": "uuid",
        "sender": "USER",
        "content": "What are your shipping times?",
        "messageType": "TEXT",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "uuid",
        "tenantId": "uuid",
        "conversationId": "uuid",
        "sender": "AI",
        "content": "We ship worldwide within 3-5 business days.",
        "messageType": "TEXT",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

`400 Bad Request` — Missing conversationId or message
`401 Unauthorized`
`404 Not Found` — Conversation not found
`500 Internal Server Error`

---

## Leads

All endpoints require authentication.

### `POST /api/v1/leads`

Create a new lead.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field               | Type   | Required | Description                                              |
|---------------------|--------|----------|----------------------------------------------------------|
| `customerId`        | string | yes      | Customer UUID                                            |
| `title`             | string | yes      | Lead title                                               |
| `description`       | string | no       | Lead description                                         |
| `source`            | string | no       | `WEBSITE` \| `WORDPRESS` \| `TELEGRAM` \| `WHATSAPP` \| `MANUAL` \| `AI` (default: `MANUAL`) |
| `value`             | number | no       | Lead monetary value                                       |
| `assignedTo`        | string | no       | User UUID to assign this lead to                          |
| `expectedCloseDate` | string | no       | ISO date string (YYYY-MM-DD)                             |
| `notes`             | string | no       | Additional notes                                          |

**Responses:**

`201 Created`
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "title": "Enterprise Package Inquiry",
    "description": "Customer wants the enterprise plan",
    "status": "NEW",
    "source": "WEBSITE",
    "value": 5000.00,
    "assignedTo": null,
    "expectedCloseDate": "2024-02-01",
    "notes": "Follow up next week",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing customerId or title
`401 Unauthorized`
`500 Internal Server Error`

---

### `GET /api/v1/leads`

List all leads for the tenant. Supports optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Name     | Type   | Required | Description                                               |
|----------|--------|----------|-----------------------------------------------------------|
| `status` | string | no       | Filter by `NEW` \| `CONTACTED` \| `QUALIFIED` \| `PROPOSAL` \| `WON` \| `LOST` |
| `source` | string | no       | Filter by source (see source enum above)                  |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "customerId": "uuid",
      "title": "Enterprise Package Inquiry",
      "description": "Customer wants the enterprise plan",
      "status": "NEW",
      "source": "WEBSITE",
      "value": 5000.00,
      "assignedTo": null,
      "expectedCloseDate": "2024-02-01",
      "notes": "Follow up next week",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

`401 Unauthorized`
`500 Internal Server Error`

---

### `GET /api/v1/leads/:id`

Get a single lead by ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Lead UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "title": "Enterprise Package Inquiry",
    "description": "Customer wants the enterprise plan",
    "status": "NEW",
    "source": "WEBSITE",
    "value": 5000.00,
    "assignedTo": null,
    "expectedCloseDate": "2024-02-01",
    "notes": "Follow up next week",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Lead not found
`500 Internal Server Error`

---

### `PATCH /api/v1/leads/:id/status`

Update a lead's status.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` — Lead UUID

**Request Body:**

| Field    | Type   | Required | Description                                              |
|----------|--------|----------|----------------------------------------------------------|
| `status` | string | yes      | `NEW` \| `CONTACTED` \| `QUALIFIED` \| `PROPOSAL` \| `WON` \| `LOST` |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "title": "Enterprise Package Inquiry",
    "description": "Customer wants the enterprise plan",
    "status": "CONTACTED",
    "source": "WEBSITE",
    "value": 5000.00,
    "assignedTo": null,
    "expectedCloseDate": "2024-02-01",
    "notes": "Follow up next week",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Missing status
`401 Unauthorized`
`404 Not Found` — Lead not found
`500 Internal Server Error`

---

## Agents

All endpoints require authentication.

### `POST /api/v1/agent`

Create an AI agent for the authenticated tenant. Only one agent per tenant is allowed.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field          | Type    | Required | Description                              |
|----------------|---------|----------|------------------------------------------|
| `name`         | string  | no       | Agent name (default: "AI Agent")         |
| `description`  | string  | no       | Agent description                        |
| `systemPrompt` | string  | no       | System prompt (default: Persian prompt)  |
| `language`     | string  | no       | Language code (default: "fa")            |
| `tone`         | string  | no       | Tone style (default: "friendly")         |
| `isActive`     | boolean | no       | Agent active state (default: true)       |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Agent created successfully",
  "agent": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "My AI Agent",
    "description": "A helpful assistant",
    "systemPrompt": "شما دستیار هوشمند کسب‌وکار هستید...",
    "language": "fa",
    "tone": "friendly",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`400 Bad Request` — Tenant ID required
`401 Unauthorized`
`409 Conflict` — Agent already exists
`500 Internal Server Error`

---

### `GET /api/v1/agent`

Get the AI agent for the authenticated tenant.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "My AI Agent",
    "description": "A helpful assistant",
    "systemPrompt": "شما دستیار هوشمند کسب‌وکار هستید...",
    "language": "fa",
    "tone": "friendly",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

`401 Unauthorized`
`404 Not Found` — Agent not found
`500 Internal Server Error`

---

### `PATCH /api/v1/agent`

Update the AI agent for the authenticated tenant.

**Headers:** `Authorization: Bearer <token>`

**Request Body** (all fields optional):

| Field          | Type    | Description                              |
|----------------|---------|------------------------------------------|
| `name`         | string  | Agent name                               |
| `description`  | string  | Agent description                        |
| `systemPrompt` | string  | System prompt                            |
| `language`     | string  | Language code                            |
| `tone`         | string  | Tone style                               |
| `isActive`     | boolean | Agent active state                       |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Agent updated successfully",
  "agent": { ... }
}
```

`401 Unauthorized`
`404 Not Found` — Agent not found
`500 Internal Server Error`

---

### `PATCH /api/v1/agent/toggle`

Toggle the AI agent's active state.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field      | Type    | Required | Description       |
|------------|---------|----------|-------------------|
| `isActive` | boolean | yes      | Active state      |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Agent activated successfully",
  "agent": { ... }
}
```

`401 Unauthorized`
`404 Not Found` — Agent not found
`500 Internal Server Error`

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "msg": "Error message in original language"
}
```

## Common HTTP Status Codes

| Code  | Description                                           |
|-------|-------------------------------------------------------|
| 200   | Success (GET or PATCH)                                |
| 201   | Created (POST)                                        |
| 400   | Bad Request — Missing or invalid input                |
| 401   | Unauthorized — Invalid or missing JWT token           |
| 404   | Not Found — Resource does not exist                   |
| 409   | Conflict — Resource already exists or conflict        |
| 410   | Gone — Token expired (installation endpoints)         |
| 500   | Internal Server Error                                 |
