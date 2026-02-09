module Redmine
  class ProjectsService
    CACHE_TTL = ENV.fetch("REDMINE_CACHE_TTL", 300).to_i.seconds

    attr_reader :client

    def initialize(client)
      @client = client
    end

    def list
      cache_key = cache_key_for("projects")
      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        client.get("/projects.json", limit: 100)
      end
    end

    private

    def cache_key_for(resource)
      "redmine:#{Digest::MD5.hexdigest(client.base_url)}:#{Digest::MD5.hexdigest(client.api_key)}:#{resource}"
    end
  end
end
