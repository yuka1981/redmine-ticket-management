require "rails_helper"

RSpec.describe "GET /api/dashboard", type: :request do
  let(:issues_response) do
    {
      issues: [
        {
          "id" => 1,
          "subject" => "Test issue",
          "status" => { "id" => 1, "name" => "New" },
          "priority" => { "id" => 2, "name" => "Normal" },
          "project" => { "id" => 1, "name" => "Test" },
          "updated_on" => "2024-01-01T00:00:00Z"
        }
      ],
      total_count: 1,
      offset: 0,
      limit: 100
    }
  end

  it "returns aggregated dashboard data" do
    # Stub the 3 parallel calls the dashboard makes
    stub_request(:get, /redmine\.example\.com\/issues\.json/)
      .to_return(
        status: 200,
        body: issues_response.to_json,
        headers: { "Content-Type" => "application/json" }
      )

    get "/api/dashboard", headers: redmine_headers

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    dashboard = json["dashboard"]
    expect(dashboard).to have_key("counts_by_status")
    expect(dashboard).to have_key("counts_by_priority")
    expect(dashboard).to have_key("overdue_count")
    expect(dashboard).to have_key("total_assigned")
    expect(dashboard).to have_key("recent_activity")
  end

  it "returns 401 without credentials" do
    get "/api/dashboard"
    expect(response).to have_http_status(:unauthorized)
  end
end
