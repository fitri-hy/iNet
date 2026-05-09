import { GoalStrategy }
from "../types";

import { goals }
from "../goals/goals";

export class IntentResolver {

  private static runtimeGoals:
    Record<string, GoalStrategy>
      = {};

  static defineGoal(
    goal: string,
    strategy: GoalStrategy
  ) {
    this.runtimeGoals[goal] =
      strategy;
  }
  
  static resolve(
    goal: string
  ): GoalStrategy {
    if (
      this.runtimeGoals[goal]
    ) {
      return this.runtimeGoals[
        goal
      ];
    }

    const strategy =
      goals[goal];
    if (!strategy) {
      throw new Error(
        `Goal not found: ${goal}`
      );
    }
    return strategy;
  }

  static all() {
    return {
      ...goals,
      ...this.runtimeGoals
    };
  }

}