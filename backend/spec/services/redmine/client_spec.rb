require "rails_helper"

RSpec.describe Redmine::Client do
  let(:client) { described_class.new(base_url: "https://redmine.example.com", api_key: "test-key") }

  describe "#get" do
    it "makes a GET request and returns parsed JSON" do
      stub_request(:get, "https://redmine.example.com/issues.json")
        .to_return(status: 200, body: { issues: [] }.to_json, headers: { "Content-Type" => "application/json" })

      result = client.get("/issues.json")
      expect(result).to eq("issues" => [])
    end

    it "passes query params" do
      stub_request(:get, "https://redmine.example.com/issues.json?limit=10&offset=0")
        .to_return(status: 200, body: { issues: [] }.to_json, headers: { "Content-Type" => "application/json" })

      result = client.get("/issues.json", limit: 10, offset: 0)
      expect(result).to eq("issues" => [])
    end

    it "raises AuthenticationError on 401" do
      stub_request(:get, "https://redmine.example.com/issues.json")
        .to_return(status: 401, body: "")

      expect { client.get("/issues.json") }.to raise_error(Redmine::ErrorHandler::AuthenticationError)
    end

    it "raises NotFoundError on 404" do
      stub_request(:get, "https://redmine.example.com/issues/999.json")
        .to_return(status: 404, body: "")

      expect { client.get("/issues/999.json") }.to raise_error(Redmine::ErrorHandler::NotFoundError)
    end
  end

  describe "#post" do
    it "makes a POST request with JSON body" do
      stub_request(:post, "https://redmine.example.com/issues.json")
        .with(body: { issue: { subject: "Test" } }.to_json)
        .to_return(status: 201, body: { issue: { id: 1, subject: "Test" } }.to_json, headers: { "Content-Type" => "application/json" })

      result = client.post("/issues.json", { issue: { subject: "Test" } })
      expect(result["issue"]["id"]).to eq(1)
    end
  end

  describe "#put" do
    it "makes a PUT request" do
      stub_request(:put, "https://redmine.example.com/issues/1.json")
        .to_return(status: 200, body: "", headers: {})

      result = client.put("/issues/1.json", { issue: { subject: "Updated" } })
      expect(result).to be_nil
    end
  end

  describe "#delete" do
    it "makes a DELETE request" do
      stub_request(:delete, "https://redmine.example.com/issues/1.json")
        .to_return(status: 200, body: "", headers: {})

      client.delete("/issues/1.json")
    end
  end
end
