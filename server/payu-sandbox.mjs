import http from "node:http";

const PAYU_BASE_URL = "https://secure.snd.payu.com";
const PORT = Number(process.env.PORT ?? 8787);
const POS_ID = process.env.PAYU_POS_ID ?? "300746";
const CLIENT_ID = process.env.PAYU_CLIENT_ID ?? POS_ID;
const CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET ?? "2ee86a66e5d97e3fadc400c9f19b065d";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5179",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function getOAuthToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(`${PAYU_BASE_URL}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`OAuth failed: ${payload.error_description ?? response.statusText}`);
  }

  return payload.access_token;
}

function toPayUProducts(lines) {
  return lines.map((line) => ({
    name: line.item.title,
    unitPrice: String(Math.round(line.item.price * 100)),
    quantity: String(line.quantity),
  }));
}

async function createPayUOrder({ continueUrl, order }) {
  const token = await getOAuthToken();
  const extOrderId = `${order.id}-${Date.now()}`;
  const totalAmount = Math.round(order.total * 100);

  const body = {
    continueUrl,
    customerIp: "127.0.0.1",
    merchantPosId: POS_ID,
    description: `Soul Restaurant ${order.id}`,
    currencyCode: "PLN",
    totalAmount: String(totalAmount),
    extOrderId,
    buyer: {
      email: "sandbox@soul-restaurant.test",
      phone: order.phone.replace(/\s/g, ""),
      firstName: order.customer,
      language: "pl",
    },
    products: toPayUProducts(order.lines),
  };

  const response = await fetch(`${PAYU_BASE_URL}/api/v2_1/orders`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok && response.status !== 302) {
    throw new Error(`Order failed: ${payload.status?.statusDesc ?? response.statusText}`);
  }

  return {
    orderId: payload.orderId,
    redirectUri: payload.redirectUri,
    status: payload.status?.statusCode,
  };
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.url !== "/api/payu/create-order" || request.method !== "POST") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = JSON.parse(rawBody);
    const result = await createPayUOrder(payload);
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown PayU sandbox error",
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`PayU sandbox proxy listening on http://127.0.0.1:${PORT}`);
});
