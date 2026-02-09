require "rails_helper"

RSpec.describe "Reference data endpoints", type: :request do
  describe "GET /api/statuses" do
    it "returns issue statuses" do
      stub_redmine_request(:get, "/issue_statuses.json", response_body: {
        issue_statuses: [
          { id: 1, name: "New", is_closed: false },
          { id: 2, name: "In Progress", is_closed: false },
          { id: 5, name: "Closed", is_closed: true }
        ]
      })

      get "/api/statuses", headers: redmine_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["issue_statuses"]).to be_an(Array)
      expect(json["issue_statuses"].length).to eq(3)
    end
  end

  describe "GET /api/priorities" do
    it "returns issue priorities" do
      stub_redmine_request(:get, "/enumerations/issue_priorities.json", response_body: {
        issue_priorities: [
          { id: 1, name: "Low", is_default: false },
          { id: 2, name: "Normal", is_default: true },
          { id: 3, name: "High", is_default: false }
        ]
      })

      get "/api/priorities", headers: redmine_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["issue_priorities"]).to be_an(Array)
    end
  end

  describe "GET /api/trackers" do
    it "returns trackers" do
      stub_redmine_request(:get, "/trackers.json", response_body: {
        trackers: [
          { id: 1, name: "Bug" },
          { id: 2, name: "Feature" },
          { id: 3, name: "Support" }
        ]
      })

      get "/api/trackers", headers: redmine_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["trackers"]).to be_an(Array)
    end
  end

  describe "GET /api/projects" do
    it "returns projects" do
      stub_redmine_pattern(:get, /redmine\.example\.com\/projects\.json/, response_body: {
        projects: [
          { id: 1, name: "Test Project", identifier: "test" }
        ],
        total_count: 1,
        offset: 0,
        limit: 100
      })

      get "/api/projects", headers: redmine_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["projects"]).to be_an(Array)
    end
  end
end
