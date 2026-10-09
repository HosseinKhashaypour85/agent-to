=== Agent-To AI Chat ===
Contributors: agent-to
Tags: chatbot, ai, customer support, live chat
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Connect a WordPress website to the Agent-To AI assistant with a floating chat widget or shortcode.

== Installation ==
1. Upload the `agent-to` plugin folder to `/wp-content/plugins/`, or install the ZIP from the WordPress Plugins screen.
2. Activate **Agent-To AI Chat**.
3. Open **Settings → Agent-To AI**.
4. Enter the Site ID created in your Agent-To customer panel. The default API URL is `https://agent-to.darkube.ir/api/v1`.
5. Save settings. The floating widget appears on the front end.
6. To embed chat in a page instead, use `[agent_to_chat]`.

== Important ==
- The Site ID must belong to the correct customer tenant and website in Agent-To.
- The public chat API must be deployed and the website's site/channel/agent must be active.
- The plugin sends messages through WordPress REST as a server-side proxy to avoid browser CORS problems.
- A basic limit of 40 messages per IP per minute is applied by the WordPress proxy. Hosting-level and API-level rate limits are still recommended for load testing.
- Do not use this initial version as a production load-testing harness until you have reviewed hosting limits, PHP worker capacity, API quotas, and privacy requirements.

== Troubleshooting ==
- **Site not found or inactive**: confirm Site ID and site status.
- **No active agent channel for this site**: activate/configure the website channel in Agent-To.
- **Agent is not active**: activate the agent in the customer panel.
- **Service unavailable / AI service error**: check the Agent-To API and AI provider status.
- **No text reply shown**: inspect the raw response in the chat; the backend may return a response format not covered by the initial response parser.

== Changelog ==
= 1.0.0 =
* Initial WordPress integration with settings page, floating widget, shortcode, REST proxy, and basic per-IP rate limit.
