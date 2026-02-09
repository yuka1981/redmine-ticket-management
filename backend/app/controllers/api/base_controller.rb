module Api
  class BaseController < ActionController::API
    before_action :require_redmine_config!

    rescue_from Redmine::ErrorHandler::AuthenticationError do |e|
      render json: { error: e.message }, status: :unauthorized
    end

    rescue_from Redmine::ErrorHandler::NotFoundError do |e|
      render json: { error: e.message }, status: :not_found
    end

    rescue_from Redmine::ErrorHandler::ValidationError do |e|
      render json: { error: e.message, errors: e.errors }, status: :unprocessable_entity
    end

    rescue_from Redmine::ErrorHandler::ConnectionError do |e|
      render json: { error: e.message }, status: :bad_gateway
    end

    rescue_from Redmine::ErrorHandler::TimeoutError do |e|
      render json: { error: e.message }, status: :gateway_timeout
    end

    rescue_from Redmine::ErrorHandler::RedmineError do |e|
      render json: { error: e.message }, status: e.status
    end

    rescue_from Faraday::ConnectionFailed do |e|
      render json: { error: "Unable to connect to Redmine server" }, status: :bad_gateway
    end

    rescue_from Faraday::TimeoutError do |e|
      render json: { error: "Redmine server request timed out" }, status: :gateway_timeout
    end

    private

    def require_redmine_config!
      unless redmine_url.present? && redmine_api_key.present?
        render json: { error: "Redmine URL and API key are required. Provide X-Redmine-Url and X-Redmine-Api-Key headers or set REDMINE_URL and REDMINE_API_KEY environment variables." },
               status: :unauthorized
      end
    end

    def redmine_url
      request.env["redmine.url"]
    end

    def redmine_api_key
      request.env["redmine.api_key"]
    end

    def redmine_client
      @redmine_client ||= Redmine::Client.new(
        base_url: redmine_url,
        api_key: redmine_api_key
      )
    end
  end
end
