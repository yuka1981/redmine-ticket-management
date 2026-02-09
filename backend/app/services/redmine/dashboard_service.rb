module Redmine
  class DashboardService
    attr_reader :client

    def initialize(client)
      @client = client
    end

    def aggregate
      threads = {
        assigned: Thread.new { fetch_assigned_issues },
        recent: Thread.new { fetch_recent_issues },
        overdue: Thread.new { fetch_overdue_issues }
      }

      results = threads.transform_values(&:value)

      build_dashboard(results)
    end

    private

    def fetch_assigned_issues
      client.get("/issues.json", assigned_to_id: "me", status_id: "open", limit: 100)
    end

    def fetch_recent_issues
      client.get("/issues.json", sort: "updated_on:desc", limit: 10)
    end

    def fetch_overdue_issues
      today = Date.today.iso8601
      client.get("/issues.json",
        assigned_to_id: "me",
        status_id: "open",
        due_date: "<=#{today}",
        limit: 100
      )
    end

    def build_dashboard(results)
      assigned_issues = results[:assigned]["issues"] || []
      recent_issues = results[:recent]["issues"] || []
      overdue_issues = results[:overdue]["issues"] || []

      {
        counts_by_status: count_by(assigned_issues, "status"),
        counts_by_priority: count_by(assigned_issues, "priority"),
        overdue_count: overdue_issues.size,
        total_assigned: results[:assigned]["total_count"] || assigned_issues.size,
        recent_activity: recent_issues.map { |i| serialize_recent(i) }
      }
    end

    def count_by(issues, field)
      issues.group_by { |i| i[field]&.dig("name") || "Unknown" }
            .transform_values(&:count)
    end

    def serialize_recent(issue)
      {
        id: issue["id"],
        subject: issue["subject"],
        status: issue.dig("status", "name"),
        priority: issue.dig("priority", "name"),
        updated_on: issue["updated_on"],
        project: issue.dig("project", "name")
      }
    end
  end
end
