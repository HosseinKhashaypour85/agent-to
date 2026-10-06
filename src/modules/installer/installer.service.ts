import crypto from "crypto";

function getApiBaseUrl(): string {
  return (
    process.env.PUBLIC_API_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function getFrontendUrl(): string {
  return (
    process.env.PUBLIC_FRONTEND_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");
}

function escapeBash(value: string): string {
  return value.replace(/'/g, "'\\''");
}

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");
}

export function generateInstallerScript(
  token: string
): string {
  if (!token?.trim()) {
    throw new Error("INSTALL_TOKEN_REQUIRED");
  }

  const apiBaseUrl = getApiBaseUrl();
  const frontendUrl = getFrontendUrl();

  const safeToken = escapeBash(token.trim());
  const safeApiUrl = escapeBash(apiBaseUrl);
  const safeFrontendUrl = escapeBash(frontendUrl);

  hashToken(token);

  return `#!/bin/bash

set -e

TOKEN='${safeToken}'
API_BASE_URL='${safeApiUrl}'
FRONTEND_URL='${safeFrontendUrl}'

echo ""
echo "======================================"
echo "       MY AI AGENT INSTALLER"
echo "======================================"
echo ""

if [ -z "$TOKEN" ]; then
  echo "ERROR: Install token is missing."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required."
  exit 1
fi

echo "[1/5] Resolving installation..."

SITE_ID=$(curl -fsSL \\
  "$API_BASE_URL/api/v1/sites/install-info?token=$TOKEN")

if [ -z "$SITE_ID" ]; then
  echo "ERROR: Could not resolve Site ID."
  exit 1
fi

case "$SITE_ID" in
  INVALID_INSTALL_TOKEN)
    echo "ERROR: Invalid install token."
    exit 1
    ;;
  INSTALL_TOKEN_EXPIRED)
    echo "ERROR: Install token has expired."
    exit 1
    ;;
  SITE_NOT_FOUND)
    echo "ERROR: Site not found."
    exit 1
    ;;
esac

echo "Site ID: $SITE_ID"

echo ""
echo "[2/5] Detecting website root..."

if [ -d "$HOME/public_html" ]; then
  WEB_ROOT="$HOME/public_html"
elif [ -d "./public_html" ]; then
  WEB_ROOT="./public_html"
else
  echo "ERROR: public_html directory not found."
  exit 1
fi

AGENT_DIR="$WEB_ROOT/ai-agent"

echo "Web root: $WEB_ROOT"
echo "Agent directory: $AGENT_DIR"

echo ""
echo "[3/5] Creating My AI Agent..."

mkdir -p "$AGENT_DIR"
mkdir -p "$AGENT_DIR/assets"

cat > "$AGENT_DIR/config.json" <<JSON
{
  "provider": "my-ai-agent",
  "installed": true,
  "siteId": "$SITE_ID"
}
JSON

cat > "$AGENT_DIR/index.html" <<HTML
<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>My AI Agent</title>

  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
    }

    body {
      font-family:
        Arial,
        Tahoma,
        sans-serif;

      background: #ffffff;
    }

    #my-ai-agent {
      width: 100%;
      min-height: 100vh;
    }

    .loading {
      min-height: 100vh;

      display: flex;
      align-items: center;
      justify-content: center;

      color: #10706B;
      font-size: 16px;
    }
  </style>
</head>

<body>

  <div id="my-ai-agent">
    <div class="loading">
      در حال بارگذاری دستیار هوشمند...
    </div>
  </div>

  <script>
    const config = {
      apiBaseUrl: '${safeApiUrl}',
      frontendUrl: '${safeFrontendUrl}',
      siteId: '$SITE_ID'
    };

    const iframe =
      document.createElement("iframe");

    iframe.src =
      config.frontendUrl +
      "/ai-agent?site=" +
      encodeURIComponent(config.siteId);

    iframe.title =
      "My AI Agent";

    iframe.style.width =
      "100%";

    iframe.style.height =
      "100vh";

    iframe.style.border =
      "0";

    iframe.style.display =
      "block";

    document
      .getElementById("my-ai-agent")
      .replaceChildren(iframe);
  </script>

</body>

</html>
HTML

echo "Agent files created."

echo ""
echo "[4/5] Registering installation..."

RESPONSE=$(curl -fsSL \\
  -X POST "$API_BASE_URL/api/v1/sites/install" \\
  -H "Content-Type: application/json" \\
  -d "{\\"token\\":\\"$TOKEN\\"}")

echo "$RESPONSE"

echo ""
echo "[5/5] Installation completed."

echo ""
echo "======================================"
echo "       MY AI AGENT READY"
echo "======================================"
echo ""

echo "Site ID: $SITE_ID"
echo "Agent URL: /ai-agent"

echo ""
`;
}