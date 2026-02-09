module Api
  class DashboardController < BaseController
    def show
      service = Redmine::DashboardService.new(redmine_client)
      data = service.aggregate
      render json: { dashboard: DashboardSerializer.serialize(data) }
    end
  end
end
