module Redmine
  class UsersService
    attr_reader :client

    def initialize(client)
      @client = client
    end

    def current_user
      client.get("/users/current.json")
    end
  end
end
