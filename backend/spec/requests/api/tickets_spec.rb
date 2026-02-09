require "rails_helper"

RSpec.describe "Tickets API", type: :request do
  let(:sample_issue) do
    {
      "id" => 1,
      "subject" => "Test ticket",
      "description" => "A test",
      "status" => { "id" => 1, "name" => "New" },
      "priority" => { "id" => 2, "name" => "Normal" },
      "tracker" => { "id" => 1, "name" => "Bug" },
      "project" => { "id" => 1, "name" => "Test Project" },
      "author" => { "id" => 1, "name" => "Admin" },
      "assigned_to" => nil,
      "start_date" => "2024-01-01",
      "due_date" => nil,
      "done_ratio" => 0,
      "estimated_hours" => nil,
      "created_on" => "2024-01-01T00:00:00Z",
      "updated_on" => "2024-01-01T00:00:00Z"
    }
  end

  describe "GET /api/tickets" do
    it "returns a list of tickets" do
      stub_redmine_pattern(:get, /redmine\.example\.com\/issues\.json/, response_body: {
        issues: [ sample_issue ],
        total_count: 1,
        offset: 0,
        limit: 25
      })

      get "/api/tickets", headers: redmine_headers, params: { scope: "assigned_to_me" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tickets"]).to be_an(Array)
      expect(json["tickets"].first["subject"]).to eq("Test ticket")
      expect(json["total_count"]).to eq(1)
    end

    it "returns 401 without credentials" do
      get "/api/tickets"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/tickets/:id" do
    it "returns ticket detail" do
      stub_redmine_pattern(:get, /redmine\.example\.com\/issues\/1\.json/, response_body: {
        issue: sample_issue.merge("journals" => [], "attachments" => [])
      })

      get "/api/tickets/1", headers: redmine_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["ticket"]["id"]).to eq(1)
      expect(json["ticket"]["subject"]).to eq("Test ticket")
    end
  end

  describe "POST /api/tickets" do
    it "creates a ticket" do
      stub_redmine_request(:post, "/issues.json",
        response_body: { issue: sample_issue },
        status: 201
      )

      post "/api/tickets",
        headers: redmine_headers.merge("Content-Type" => "application/json"),
        params: { ticket: { subject: "Test", project_id: 1, tracker_id: 1, priority_id: 2 } }.to_json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["ticket"]["subject"]).to eq("Test ticket")
    end
  end

  describe "PUT /api/tickets/:id" do
    it "updates a ticket" do
      stub_redmine_request(:put, "/issues/1.json", response_body: "", status: 200)

      put "/api/tickets/1",
        headers: redmine_headers.merge("Content-Type" => "application/json"),
        params: { ticket: { subject: "Updated" } }.to_json

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "DELETE /api/tickets/:id" do
    it "deletes a ticket" do
      stub_redmine_request(:delete, "/issues/1.json", response_body: "", status: 200)

      delete "/api/tickets/1", headers: redmine_headers

      expect(response).to have_http_status(:no_content)
    end
  end
end
