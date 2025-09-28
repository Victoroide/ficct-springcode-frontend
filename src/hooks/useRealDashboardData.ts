/**
 * useRealDashboardData.ts - Hook para datos reales del dashboard
 */
import { useMemo } from 'react';
import { 
  useGetGeneratedProjectStatsQuery,
  useGetProjectStatsQuery,
  useGetRecentProjectsQuery,
  transformToDashboardStats,
  transformToRecentProjects,
  transformToRecentActivities 
} from '@/store/api/realStatsApi';
import type { DashboardData } from '@/types/dashboard';

export const useRealDashboardData = () => {
  // Fetch real data from backend
  const { 
    data: generatedStats, 
    isLoading: isGeneratedStatsLoading,
    error: generatedStatsError 
  } = useGetGeneratedProjectStatsQuery();
  
  const { 
    data: projectStats, 
    isLoading: isProjectStatsLoading,
    error: projectStatsError 
  } = useGetProjectStatsQuery();
  
  const { 
    data: recentProjectsData, 
    isLoading: isRecentProjectsLoading,
    error: recentProjectsError 
  } = useGetRecentProjectsQuery({ limit: 10 });

  // Combine loading states
  const isLoading = isGeneratedStatsLoading || isProjectStatsLoading || isRecentProjectsLoading;
  
  // Combine errors
  const error = generatedStatsError || projectStatsError || recentProjectsError;

  // Transform data to dashboard format
  const dashboardData = useMemo((): DashboardData => {
    const stats = transformToDashboardStats(generatedStats, projectStats);
    const recentProjects = transformToRecentProjects(recentProjectsData?.results);
    const recentActivities = transformToRecentActivities(recentProjectsData?.results);

    return {
      stats,
      recentProjects,
      recentActivities,
    };
  }, [generatedStats, projectStats, recentProjectsData]);

  return {
    data: dashboardData,
    isLoading,
    error,
    refetch: () => {
      // Trigger refetch for all queries
      // This could be improved with RTK Query's refetch methods
    }
  };
};

export default useRealDashboardData;
