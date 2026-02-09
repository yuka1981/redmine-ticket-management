require "faraday/net_http_persistent"

module Redmine
  class Client
    DEFAULT_TIMEOUT = 15
    DEFAULT_OPEN_TIMEOUT = 5

    attr_reader :base_url, :api_key

    def initialize(base_url:, api_key:)
      @base_url = base_url.chomp("/")
      @api_key = api_key
    end

    def get(path, params = {})
      response = connection.get(path) do |req|
        req.params = params
      end
      handle(response)
    end

    def post(path, body = {})
      response = connection.post(path) do |req|
        req.body = body.to_json
      end
      handle(response)
    end

    def put(path, body = {})
      response = connection.put(path) do |req|
        req.body = body.to_json
      end
      handle(response)
    end

    def delete(path)
      response = connection.delete(path)
      handle(response)
    end

    private

    def connection
      @connection ||= Faraday.new(url: base_url, ssl: ssl_options) do |f|
        f.request :retry, max: 2, interval: 0.5, backoff_factor: 2,
                  exceptions: [ Faraday::TimeoutError, Faraday::ConnectionFailed ]
        f.headers["Content-Type"] = "application/json"
        f.headers["X-Redmine-API-Key"] = api_key
        f.options.timeout = DEFAULT_TIMEOUT
        f.options.open_timeout = DEFAULT_OPEN_TIMEOUT
        f.adapter :net_http_persistent
      end
    end

    def ssl_options
      { verify: ENV["REDMINE_SSL_VERIFY"] != "false" }
    end

    def handle(response)
      Redmine::ErrorHandler.handle_response(response)
      parse_body(response)
    end

    def parse_body(response)
      return nil if response.body.nil? || response.body.empty?
      JSON.parse(response.body)
    rescue JSON::ParserError
      response.body
    end
  end
end
