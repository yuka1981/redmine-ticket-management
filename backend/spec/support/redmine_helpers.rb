module RedmineHelpers
  def redmine_headers
    {
      "X-Redmine-Url" => "https://redmine.example.com",
      "X-Redmine-Api-Key" => "test-api-key-12345"
    }
  end

  def stub_redmine_request(method, path, response_body:, status: 200)
    url = "https://redmine.example.com#{path}"
    stub_request(method, url)
      .to_return(
        status: status,
        body: response_body.is_a?(String) ? response_body : response_body.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  def stub_redmine_pattern(method, pattern, response_body:, status: 200)
    stub_request(method, pattern)
      .to_return(
        status: status,
        body: response_body.is_a?(String) ? response_body : response_body.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end
end

RSpec.configure do |config|
  config.include RedmineHelpers
end
