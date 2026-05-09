import { GoalStrategy }
from "../types";

import { Priority }
from "../types/Priority";

import { DeliveryMode }
from "../types/DeliveryMode";

export const goals:
Record<string, GoalStrategy> = {

  "realtime-chat": {

    transport: "websocket",

    fallback: ["http"],

    retry: true,

    priority: Priority.HIGH,

    ordered: true,

    delivery:
      DeliveryMode.AT_LEAST_ONCE
  },

  "analytics": {

    transport: "http",

    retry: false,

    priority: Priority.LOW,

    ordered: false,

    delivery:
      DeliveryMode.AT_MOST_ONCE
  },

  "guaranteed-delivery": {

    transport: "websocket",

    fallback: ["http"],

    retry: true,

    priority: Priority.CRITICAL,

    ordered: true,

    delivery:
      DeliveryMode.EXACTLY_ONCE
  }

};