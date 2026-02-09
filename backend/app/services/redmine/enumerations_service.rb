module Redmine
  class EnumerationsService
    CACHE_TTL = ENV.fetch("REDMINE_CACHE_TTL", 300).to_i.seconds

    attr_reader :client

    def initialize(client)
      @client = client
    end

    def statuses
      cache_key = cache_key_for("statuses")
      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        client.get("/issue_statuses.json")
      end
    end

    def priorities
      cache_key = cache_key_for("priorities")
      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        client.get("/enumerations/issue_priorities.json")
      end
    end

    def trackers
      cache_key = cache_key_for("trackers")
      Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        client.get("/trackers.json")
      end
    end

    private

    def cache_key_for(resource)
      "redmine:#{Digest::MD5.hexdigest(client.base_url)}:#{Digest::MD5.hexdigest(client.api_key)}:#{resource}"
    end
  end
end
