/**
 * Security Status Card Component
 * Displays user security information and recommendations
 */
import React from 'react';
import { useAppSelector } from '@/hooks/redux';
import { 
  selectSecurityStatus, 
  selectSecurityScore,
  selectSecurityRecommendations
} from '@/store/slices/userSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function SecurityStatusCard() {
  const securityStatus = useAppSelector(selectSecurityStatus);
  const securityScore = useAppSelector(selectSecurityScore);
  const recommendations = useAppSelector(selectSecurityRecommendations);
  
  // If no security status is available, show placeholder
  if (!securityStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>Loading security information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Determine security score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Determine progress bar color
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Security feature status item component
  const SecurityFeatureItem = ({ 
    title, 
    enabled, 
    critical = false 
  }: { 
    title: string; 
    enabled: boolean; 
    critical?: boolean;
  }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center">
        {enabled ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
        ) : (
          critical ? (
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
          )
        )}
        <span className={enabled ? '' : critical ? 'text-red-500' : 'text-amber-500'}>
          {title}
        </span>
      </div>
      {!enabled && (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          Enable
        </Button>
      )}
    </div>
  );
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            {securityScore >= 80 ? (
              <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
            ) : securityScore >= 60 ? (
              <Shield className="mr-2 h-5 w-5 text-amber-500" />
            ) : (
              <ShieldAlert className="mr-2 h-5 w-5 text-red-500" />
            )}
            Security Status
          </CardTitle>
          <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}/100
          </div>
        </div>
        <Progress 
          value={securityScore} 
          max={100} 
          className={`h-2 mt-2 ${getProgressColor(securityScore)}`} 
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Security Features</h3>
            <div className="space-y-1">
              <SecurityFeatureItem 
                title="Two-Factor Authentication" 
                enabled={securityStatus["2fa_enabled"]}
                critical={true} 
              />
              <SecurityFeatureItem 
                title="Email Verification" 
                enabled={securityStatus.email_verified} 
              />
              <SecurityFeatureItem 
                title="Backup Codes" 
                enabled={securityStatus.backup_codes_available > 0} 
              />
              <SecurityFeatureItem 
                title="Recent Password Change" 
                enabled={securityStatus.last_password_change !== null} 
              />
            </div>
          </div>
          
          {recommendations.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="space-y-1 text-sm">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button className="w-full mt-4">
            Improve Security
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
