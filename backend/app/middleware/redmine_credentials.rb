class RedmineCredentials
  REDMINE_URL_HEADER = "HTTP_X_REDMINE_URL"
  REDMINE_KEY_HEADER = "HTTP_X_REDMINE_API_KEY"

  def initialize(app)
    @app = app
  end

  def call(env)
    env["redmine.url"] = extract_url(env)
    env["redmine.api_key"] = extract_api_key(env)
    @app.call(env)
  end

  private

  def extract_url(env)
    env[REDMINE_URL_HEADER].presence || ENV["REDMINE_URL"]
  end

  def extract_api_key(env)
    env[REDMINE_KEY_HEADER].presence || ENV["REDMINE_API_KEY"]
  end
end
