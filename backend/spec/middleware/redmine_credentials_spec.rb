require "rails_helper"

RSpec.describe RedmineCredentials do
  let(:app) { ->(env) { [ 200, env, "OK" ] } }
  let(:middleware) { described_class.new(app) }

  it "extracts credentials from headers" do
    env = {
      "HTTP_X_REDMINE_URL" => "https://redmine.example.com",
      "HTTP_X_REDMINE_API_KEY" => "test-key"
    }

    _status, result_env, _body = middleware.call(env)

    expect(result_env["redmine.url"]).to eq("https://redmine.example.com")
    expect(result_env["redmine.api_key"]).to eq("test-key")
  end

  it "falls back to ENV variables when headers are missing" do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("REDMINE_URL").and_return("https://env-redmine.example.com")
    allow(ENV).to receive(:[]).with("REDMINE_API_KEY").and_return("env-key")

    _status, result_env, _body = middleware.call({})

    expect(result_env["redmine.url"]).to eq("https://env-redmine.example.com")
    expect(result_env["redmine.api_key"]).to eq("env-key")
  end

  it "prefers headers over ENV variables" do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("REDMINE_URL").and_return("https://env.example.com")
    allow(ENV).to receive(:[]).with("REDMINE_API_KEY").and_return("env-key")

    env = {
      "HTTP_X_REDMINE_URL" => "https://header.example.com",
      "HTTP_X_REDMINE_API_KEY" => "header-key"
    }

    _status, result_env, _body = middleware.call(env)

    expect(result_env["redmine.url"]).to eq("https://header.example.com")
    expect(result_env["redmine.api_key"]).to eq("header-key")
  end
end
