class TicketSerializer
  def self.serialize(issue)
    {
      id: issue["id"],
      subject: issue["subject"],
      description: issue["description"],
      status: reference_data(issue, "status"),
      priority: reference_data(issue, "priority"),
      tracker: reference_data(issue, "tracker"),
      project: reference_data(issue, "project"),
      author: reference_data(issue, "author"),
      assigned_to: reference_data(issue, "assigned_to"),
      start_date: issue["start_date"],
      due_date: issue["due_date"],
      done_ratio: issue["done_ratio"],
      estimated_hours: issue["estimated_hours"],
      created_on: issue["created_on"],
      updated_on: issue["updated_on"]
    }
  end

  def self.serialize_collection(data)
    issues = data["issues"] || []
    {
      tickets: issues.map { |i| serialize(i) },
      total_count: data["total_count"] || issues.size,
      offset: data["offset"] || 0,
      limit: data["limit"] || 25
    }
  end

  def self.reference_data(issue, key)
    value = issue[key]
    return nil unless value
    { id: value["id"], name: value["name"] }
  end
end
