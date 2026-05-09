const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });
const rooms = new Map();
const processedIds = new Set();

console.log('--- iNet Extreme Testing Server ---');

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const frame = JSON.parse(message.toString());
    const { id, goal, payload, room, ttl, timestamp, correlationId, encrypted, sequence } = frame;

    // 1. Simulasikan Packet Loss (untuk menguji Retry di Client)
    // Abaikan pesan jika goal adalah 'test-retry' (simulasi gagal 50%)
    if (goal === 'test-retry' && Math.random() < 0.5) {
      console.log(`[Server] Simulating Drop Message: ${id}`);
      return;
    }

    // 2. TTL Check
    if (ttl && (Date.now() - timestamp > ttl)) {
      console.log(`[Server] Expired: ${id}`);
      return;
    }

    // 3. Deduplication Check
    if (processedIds.has(id)) {
      console.warn(`[Server] DUPLICATE DETECTED: ${id}`);
      ws.send(JSON.stringify({ ack: id, goal, status: 'duplicate_ignored' }));
      return;
    }
    processedIds.add(id);

    // 4. Room Management
    if (room) {
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(ws);
    }

    // 5. Sequence Monitor
    const seqInfo = sequence !== undefined ? `| Seq: ${sequence}` : '';
    console.log(`[Rx] ${goal} ${seqInfo} | Room: ${room || 'Global'} | ID: ${id}`);

    // 6. Logic Routing (20+ Case Handlers)
    let responsePayload = { status: "received" };

    if (goal === 'get-vault-data') responsePayload = { data: "Secret-123" };
    if (goal === 'compute-task') responsePayload = { result: Math.pow(payload.num, 2) };
    if (goal === 'check-status') responsePayload = { uptime: process.uptime() };

    // 7. Broadcast logic
    if (room && rooms.has(room)) {
      rooms.get(room).forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ from: id, room, payload, goal, encrypted }));
        }
      });
    }

    // 8. Send ACK + Response
    ws.send(JSON.stringify({
      ack: id,
      goal: goal,
      correlationId: correlationId,
      payload: responsePayload,
      encrypted: !!encrypted
    }));
  });
});

console.log('Server running on ws://localhost:3000');