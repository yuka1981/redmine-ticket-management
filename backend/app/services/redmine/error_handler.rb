module Redmine
  module ErrorHandler
    class RedmineError < StandardError
      attr_reader :status, :errors

      def initialize(message = nil, status: 500, errors: [])
        @status = status
        @errors = errors
        super(message || "Redmine API error")
      end
    end

    class AuthenticationError < RedmineError
      def initialize(message = "Invalid or missing Redmine credentials")
        super(message, status: 401)
      end
    end

    class NotFoundError < RedmineError
      def initialize(message = "Resource not found")
        super(message, status: 404)
      end
    end

    class ValidationError < RedmineError
      def initialize(message = "Validation failed", errors: [])
        super(message, status: 422, errors: errors)
      end
    end

    class ConnectionError < RedmineError
      def initialize(message = "Unable to connect to Redmine server")
        super(message, status: 502)
      end
    end

    class TimeoutError < RedmineError
      def initialize(message = "Redmine server request timed out")
        super(message, status: 504)
      end
    end

    def self.handle_response(response)
      case response.status
      when 200..299
        response
      when 401, 403
        raise AuthenticationError
      when 404
        raise NotFoundError
      when 422
        errors = parse_errors(response)
        raise ValidationError.new(errors: errors)
      when 500..599
        raise ConnectionError, "Redmine server error (#{response.status})"
      else
        raise RedmineError.new("Unexpected response: #{response.status}", status: response.status)
      end
    end

    def self.parse_errors(response)
      body = JSON.parse(response.body)
      body["errors"] || []
    rescue JSON::ParserError
      [ response.body ]
    end
  end
end
