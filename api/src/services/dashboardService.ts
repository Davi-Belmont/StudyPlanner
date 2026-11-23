import { disciplineRepository } from "../repositories/disciplineRepository";
import { activityRepository } from "../repositories/activityRepository";

export const dashboardService = {
  async getDashboard() {
    const [
      disciplineCount,
      pendingActivities,
      upcomingActivities,
      disciplines
    ] = await Promise.all([
      disciplineRepository.count(),
      activityRepository.countPending(),
      activityRepository.findUpcoming(),
      disciplineRepository.findAll()
    ]);

    const averages = disciplines.map((discipline) => {
      const average =
        discipline.grades.length > 0
          ? discipline.grades.reduce(
              (sum, grade) => sum + grade.value,
              0
            ) / discipline.grades.length
          : null;

      return {
        disciplineId: discipline.id,
        disciplineName: discipline.name,
        average
      };
    });

    return {
      disciplineCount,
      pendingActivities,
      upcomingActivities,
      averages
    };
  }
};