package com.alumniconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private Long totalUsers;
    private Long totalStudents;
    private Long totalAlumni;
    private Long verifiedAlumni;
    private Long pendingVerifications;
    private Long activeMentorships;
    private Long totalJobs;
    private Long totalApplications;
    private Long upcomingEvents;
}
