=== Agent-To AI Chat ===
Contributors: agent-to
Tags: chatbot, ai, customer support, live chat
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 2.7.1
License: GPLv2 or later

Connect WordPress to Agent-To with a dedicated /ai-agent page, an optional floating chat widget, product detection, and a server-side REST proxy.

== Installation ==
1. Download the ZIP and upload it from Plugins > Add New > Upload Plugin.
2. Activate Agent-To AI Chat.
3. Open Settings > Agent-To AI.
4. In your Agent-To panel, create an installation token for the intended site.
5. Paste the one-time token in the plugin and click "اتصال و نصب سایت". The plugin calls POST /api/v1/sites/install and saves the returned Site ID. The token is not saved.
6. Save settings and click "تست اتصال به API".
7. Open the public website and send a test message.

== Manual setup ==
If the site was already installed, enter its Site ID manually and set the API Base URL. Default:
https://agentto.jorluma.ir/api/v1

== Dedicated agent page ==
After connecting the site, the plugin registers /ai-agent automatically. Visit:
https://your-domain.com/ai-agent?siteId=YOUR_SITE_ID

The page displays the central Agent-To Next.js app and does not require a shortcode. The floating widget remains independent. The plugin also exposes /customer-login and /customer-dashboard, which load the existing customer login and dashboard pages from the central app on the customer's own domain.

== Backend requirements ==
- The Site ID must exist and be ACTIVE.
- An active WORDPRESS AgentChannel must exist for the same tenant.
- The agent must be active and the AI provider must be configured.
- The backend chat gateway accepts siteId, visitorId, message and channel. This plugin sends channel=WORDPRESS.
- The plugin uses a WordPress REST endpoint as a server-side proxy, so the browser does not call the backend directly.
- A basic rate limit of 40 requests per client IP per minute is applied by the WordPress proxy. Add upstream rate limiting for production.

== Troubleshooting ==
- **Installation failed**: generate a fresh installation token; installation tokens are one-time-use and may expire.
- **Site not found or inactive**: confirm the Site ID and site status in Agent-To.
- **No active agent channel for this site**: activate/configure the WORDPRESS channel for this tenant in Agent-To.
- **Agent is not active**: activate the agent in the customer panel.
- **AI service error**: check the backend logs and AI provider credentials.
- **API test fails**: confirm API Base URL, outbound HTTPS from the WordPress host, and that the backend is reachable.

== Customer panel routes ==
After activating the plugin, these routes are available on the customer's domain:
* https://your-domain.com/customer-login
* https://your-domain.com/customer-dashboard

They display the existing central Agent-To pages inside a full-screen iframe; they do not deploy a separate Next.js runtime to the customer's PHP hosting. WordPress refreshes rewrite rules when the plugin version changes.

== Changelog ==
= 2.7.1 =
* Prevents Elementor frontend scripts from running on Agent-To iframe routes where Elementor configuration is not present.

= 2.7.0 =
* Updated API and embedded frontend URLs to https://agentto.jorluma.ir.
* Migrates legacy Agent-To API host settings to the current endpoint.
* Added an editable API Base URL field and fixed saving the validated URL.
* Bumped the plugin version to refresh widget assets and rewrite rules.

= 2.4.0 =
* Added /customer-login and /customer-dashboard routes on the customer's domain.
* Hid the floating widget on customer panel routes.
* Added a dedicated /ai-agent route without requiring a shortcode.
* Kept the floating widget as a separate setting and hid it on the full-page route.

= 2.2.0 =
* Moved chat widget CSS and JavaScript into separate asset files for easier UI/UX updates.
* Added asset versioning to refresh cached widget files after plugin updates.

= 2.0.0 =
* Added one-time installation-token connection flow.
* Added API connection test.
* Updated chat payload to match the current chat gateway and WORDPRESS channel.
* Added server-side proxy validation and per-IP rate limiting.
* Improved widget response handling and visitor isolation by host.
