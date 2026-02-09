class TicketDetailSerializer
  def self.serialize(data)
    issue = data["issue"]
    return nil unless issue

    base = TicketSerializer.serialize(issue)
    base.merge(
      journals: serialize_journals(issue["journals"] || []),
      attachments: serialize_attachments(issue["attachments"] || []),
      relations: issue["relations"] || [],
      children: serialize_children(issue["children"] || []),
      watchers: serialize_watchers(issue["watchers"] || []),
      custom_fields: serialize_custom_fields(issue["custom_fields"] || [])
    )
  end

  def self.serialize_journals(journals)
    journals.map do |j|
      {
        id: j["id"],
        user: j["user"] ? { id: j["user"]["id"], name: j["user"]["name"] } : nil,
        notes: j["notes"],
        created_on: j["created_on"],
        details: (j["details"] || []).map do |d|
          {
            property: d["property"],
            name: d["name"],
            old_value: d["old_value"],
            new_value: d["new_value"]
          }
        end
      }
    end
  end

  def self.serialize_attachments(attachments)
    attachments.map do |a|
      {
        id: a["id"],
        filename: a["filename"],
        filesize: a["filesize"],
        content_type: a["content_type"],
        content_url: a["content_url"],
        author: a["author"] ? { id: a["author"]["id"], name: a["author"]["name"] } : nil,
        created_on: a["created_on"]
      }
    end
  end

  def self.serialize_children(children)
    children.map do |c|
      {
        id: c["id"],
        subject: c["subject"],
        tracker: c["tracker"] ? { id: c["tracker"]["id"], name: c["tracker"]["name"] } : nil
      }
    end
  end

  def self.serialize_watchers(watchers)
    watchers.map do |w|
      { id: w["id"], name: w["name"] }
    end
  end

  def self.serialize_custom_fields(fields)
    fields.map do |f|
      { id: f["id"], name: f["name"], value: f["value"] }
    end
  end
end
