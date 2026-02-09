class DashboardSerializer
  def self.serialize(data)
    {
      counts_by_status: data[:counts_by_status],
      counts_by_priority: data[:counts_by_priority],
      overdue_count: data[:overdue_count],
      total_assigned: data[:total_assigned],
      recent_activity: data[:recent_activity]
    }
  end
end
