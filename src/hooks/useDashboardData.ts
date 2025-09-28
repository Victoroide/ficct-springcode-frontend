/**
 * Dashboard Data Hook
 * Custom hook that aggregates dashboard data from multiple sources
 * Compatible with existing API structure
 */

import { useMemo } from 'react';
import { useListDiagramsQuery } from '@/store/api/umlApi';
import { useListRequestsQuery } from '@/store/api/generationApi';
import type { DashboardStats, RecentActivity } from '@/types/dashboard';

export const useDashboardData = () => {
  // Use existing API queries
  const { 
    data: diagramsData, 
    isLoading: diagramsLoading, 
    error: diagramsError,
    refetch: refetchDiagrams 
  } = useListDiagramsQuery({ pagesize: 10 });
  
  const { 
    data: requestsData, 
    isLoading: requestsLoading, 
    error: requestsError,
    refetch: refetchRequests 
  } = useListRequestsQuery({ pagesize: 10 });

  // Calculate dashboard statistics from real data
  const dashboardStats: DashboardStats = useMemo(() => {
    return {
      diagramsCreated: diagramsData?.count || 0,
      projectsGenerated: requestsData?.count || 0,
      collaborations: 4, // This would come from collaboration API when available
      timeSaved: "24h", // This would be calculated from actual data
      growthMetrics: {
        diagrams: 12, // Calculate from historical data when available
        projects: 8,
        collaborations: 25,
        timeSaved: 15
      }
    };
  }, [diagramsData?.count, requestsData?.count]);

  // Generate recent activity from API data
  const recentActivity: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = [];

    // Add recent diagrams as activities
    if (diagramsData?.results) {
      diagramsData.results.slice(0, 3).forEach((diagram, index) => {
        activities.push({
          id: `diagram-${diagram.id}`,
          type: 'diagram_created',
          title: `Creó diagrama "${diagram.name}"`,
          timestamp: diagram.updatedAt,
          status: 'completed',
          metadata: { diagramName: diagram.name }
        });
      });
    }

    // Add recent projects as activities
    if (requestsData?.results) {
      requestsData.results.slice(0, 3).forEach((request, index) => {
        activities.push({
          id: `project-${request.id}`,
          type: 'project_generated',
          title: `Generó proyecto "${request.generationConfig?.artifactId || 'SpringBoot Project'}"`,
          timestamp: request.createdAt,
          status: request.status === 'COMPLETED' ? 'completed' : 
                   request.status === 'PENDING' ? 'in_progress' : 
                   request.status === 'ERROR' ? 'failed' : 'completed',
          metadata: { projectName: request.generationConfig?.artifactId }
        });
      });
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 6); // Limit to 6 most recent activities
  }, [diagramsData?.results, requestsData?.results]);

  const isLoading = diagramsLoading || requestsLoading;
  const hasError = diagramsError || requestsError;

  const refetchAll = () => {
    refetchDiagrams();
    refetchRequests();
  };

  return {
    // Statistics
    stats: dashboardStats,
    
    // Recent data
    recentActivity,
    recentProjects: requestsData?.results || [],
    recentDiagrams: diagramsData?.results || [],
    
    // API state
    isLoading,
    hasError,
    
    // Actions
    refetchAll,
    
    // Individual refetch functions
    refetchDiagrams,
    refetchRequests,
    
    // Error details
    errors: {
      diagrams: diagramsError,
      requests: requestsError
    }
  };
};

export default useDashboardData;
