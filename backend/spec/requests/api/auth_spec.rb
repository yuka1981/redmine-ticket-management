require "rails_helper"

RSpec.describe "POST /api/auth/verify", type: :request do
  it "returns user info on valid credentials" do
    stub_redmine_request(:get, "/users/current.json", response_body: {
      user: {
        id: 1,
        login: "admin",
        firstname: "Admin",
        lastname: "User",
        mail: "admin@example.com"
      }
    })

    post "/api/auth/verify", headers: redmine_headers

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    expect(json["authenticated"]).to be true
    expect(json["user"]["login"]).to eq("admin")
  end

  it "returns 401 without credentials" do
    post "/api/auth/verify"

    expect(response).to have_http_status(:unauthorized)
  end
end
