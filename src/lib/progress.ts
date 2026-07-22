import { format, subDays } from "date-fns";
import { Task } from "@/store/taskStore";
import { Habit, computeHabitStreak, isDailyHabit } from "@/store/habitStore";
import { Goal, countGoalsCompletedInPeriod } from "@/store/goalStore";

export interface TaskDayPoint {
  date: Date;
  label: string;
  total: number;
  done: number;
}

// Last `days` calendar days (oldest first) with that day's task completion —
// mirrors getRecentTrend's shape (src/lib/patterns.ts) so the two charts read
// the same way even though they live on different pages.
export function computeTaskTrend(tasks: Task[], days = 14): TaskDayPoint[] {
  const points: TaskDayPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = subDays(new Date(), i);
    const key = format(date, "yyyy-MM-dd");
    const forDate = tasks.filter((t) => t.date === key);
    points.push({
      date,
      label: format(date, "EEEEE"),
      total: forDate.length,
      done: forDate.filter((t) => t.completed).length,
    });
  }
  return points;
}

export interface HabitConsistency {
  id: string;
  title: string;
  percent: number;
  streak: number;
  isDaily: boolean;
}

// Percentage of the last `days` days each habit was completed on relative
// to what its own frequency expects, plus its current streak — a single
// streak number hides a habit that's done most days (or most weeks, for a
// non-daily one) but recently broke a chain, so this rounds that out. A
// "3x/week" habit is compared against 3/7 of the window, not against every
// day, so a habit that's perfectly on pace for its own cadence shows 100%
// instead of looking permanently behind.
export function computeHabitConsistency(habits: Habit[], days = 30): HabitConsistency[] {
  const cutoff = subDays(new Date(), days - 1);
  return habits
    .map((habit) => {
      const inWindow = habit.completions.filter((d) => new Date(d) >= cutoff).length;
      const expected = (habit.targetPerWeek / 7) * days;
      return {
        id: habit.id,
        title: habit.title,
        percent: Math.round(Math.min(inWindow / expected, 1) * 100),
        streak: computeHabitStreak(habit),
        isDaily: isDailyHabit(habit),
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

export interface GoalsSummary {
  active: number;
  completedThisMonth: number;
  completedThisYear: number;
  avgProgress: number;
}

export function computeGoalsSummary(goals: Goal[]): GoalsSummary {
  const now = new Date();
  return {
    active: goals.filter((g) => !g.completedAt).length,
    completedThisMonth: countGoalsCompletedInPeriod(goals, now.getFullYear(), now.getMonth()),
    completedThisYear: countGoalsCompletedInPeriod(goals, now.getFullYear()),
    avgProgress:
      goals.length === 0 ? 0 : Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length),
  };
}
