import { IntentEngine } from "../src/core/IntentEngine";
import { Priority } from "../src/types/Priority";
import { DeliveryMode } from "../src/types/DeliveryMode";

async function runExtremeSuites() {
  const inet = new IntentEngine("ws://localhost:3000");

  // --- CONFIGURATION ---
  // Pastikan semua properti wajib (transport, retry, priority) terisi
  
  inet.defineGoal("secure-rpc", { 
    transport: "websocket", 
    encryptionKey: "K0D3_R4H4514", 
    retry: true, 
    priority: Priority.CRITICAL 
  });

  inet.defineGoal("fast-data", { 
    transport: "websocket", 
    fallback: ["http"], 
    retry: false, 
    priority: Priority.LOW 
  });

  inet.defineGoal("ordered-stream", { 
    transport: "websocket", 
    ordered: true, 
    retry: false, // Tambahkan ini (Wajib)
    priority: Priority.MEDIUM 
  });

  inet.defineGoal("test-retry", { 
    transport: "websocket", 
    retry: true, 
    priority: Priority.HIGH 
  });

  inet.defineGoal("exactly-once-goal", { 
    transport: "websocket", 
    delivery: DeliveryMode.EXACTLY_ONCE, 
    retry: true, 
    priority: Priority.MEDIUM // Tambahkan ini (Wajib)
  });

  console.log("Starting 22 Test Cases...");

  // GROUP: Security (1-5)
  console.log("\n[Group: Security]");
  await inet.send({ secret: "Data 1" }, { goal: "secure-rpc", encrypted: true });
  await inet.send({ secret: "Data 2" }, { goal: "secure-rpc", encrypted: true });
  await inet.send({ cmd: "ping" }, { goal: "secure-rpc", encrypted: false });
  await inet.send({ val: 100 }, { goal: "secure-rpc", encrypted: true, correlationId: "custom-id-1" });
  await inet.send({ val: 200 }, { goal: "secure-rpc", encrypted: true, correlationId: "custom-id-2" });

  // GROUP: Racing & Fallback (6-10)
  console.log("\n[Group: Racing & Fallback]");
  inet.send({ info: "Race 1" }, { goal: "fast-data", race: true });
  inet.send({ info: "Race 2" }, { goal: "fast-data", race: true });
  inet.send({ info: "No Race" }, { goal: "fast-data", race: false });
  inet.send({ info: "Fallback Only" }, { goal: "fast-data", room: "test-room" });
  await inet.send({ num: 5 }, { goal: "fast-data", race: true });

  // GROUP: Rooms (11-15)
  console.log("\n[Group: Rooms]");
  inet.joinRoom("lobby");
  inet.send({ msg: "Hi Lobby" }, { goal: "fast-data" });
  inet.send({ msg: "Direct to VIP" }, { goal: "fast-data", room: "vip-lounge" }); 
  inet.leaveRoom();
  inet.send({ msg: "Global again" }, { goal: "fast-data" });
  inet.joinRoom("emergency");
  await inet.send({ alert: "Red" }, { goal: "fast-data" });

  // GROUP: TTL (16-18)
  console.log("\n[Group: TTL]");
  inet.send({ pos: 1 }, { goal: "fast-data", ttl: 100 }); 
  inet.send({ pos: 2 }, { goal: "fast-data", ttl: 10000 }); 
  await inet.send({ pos: 3 }, { goal: "fast-data", ttl: 500 });

  // GROUP: Ordering (19-20)
  console.log("\n[Group: Ordering]");
  inet.send({ part: "First" }, { goal: "ordered-stream" });
  inet.send({ part: "Second" }, { goal: "ordered-stream" });
  inet.send({ part: "Third" }, { goal: "ordered-stream" });

  // GROUP: Reliability (21)
  console.log("\n[Group: Reliability]");
  await inet.send({ attempt: "Must Arrive" }, { goal: "test-retry" });

  // GROUP: Deduplication (22)
  const dupId = "UNIQUE-KEY-999";
  console.log("\n[Group: Deduplication]");
  inet.send({ pay: 50 }, { goal: "exactly-once-goal", correlationId: dupId });
  inet.send({ pay: 50 }, { goal: "exactly-once-goal", correlationId: dupId }); 

  console.log("\n--- All Cases Injected to Queue ---");
}

runExtremeSuites().catch(console.error);