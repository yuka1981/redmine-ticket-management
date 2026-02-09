module Redmine
  class IssuesService
    attr_reader :client

    def initialize(client)
      @client = client
    end

    def list(params = {})
      query = build_list_params(params)
      client.get("/issues.json", query)
    end

    def find(id)
      client.get("/issues/#{id}.json", include: "journals,attachments,changesets,relations,children,watchers")
    end

    def create(attributes)
      client.post("/issues.json", { issue: attributes })
    end

    def update(id, attributes)
      client.put("/issues/#{id}.json", { issue: attributes })
    end

    def destroy(id)
      client.delete("/issues/#{id}.json")
    end

    private

    def build_list_params(params)
      query = {
        limit: params[:per_page] || 25,
        offset: calculate_offset(params[:page], params[:per_page])
      }

      apply_scope(query, params[:scope])
      apply_filters(query, params)
      apply_sort(query, params[:sort])

      query.compact
    end

    def calculate_offset(page, per_page)
      page = (page || 1).to_i
      per_page = (per_page || 25).to_i
      (page - 1) * per_page
    end

    def apply_scope(query, scope)
      case scope
      when "assigned_to_me"
        query[:assigned_to_id] = "me"
      when "created_by_me"
        query[:author_id] = "me"
      when "watched"
        query[:watcher_id] = "me"
      end
    end

    def apply_filters(query, params)
      query[:status_id] = params[:status_id] if params[:status_id].present?
      query[:project_id] = params[:project_id] if params[:project_id].present?
      query[:tracker_id] = params[:tracker_id] if params[:tracker_id].present?
      query[:priority_id] = params[:priority_id] if params[:priority_id].present?
    end

    def apply_sort(query, sort)
      query[:sort] = sort if sort.present?
    end
  end
end
